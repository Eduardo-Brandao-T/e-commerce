import { Controller, Logger, NotFoundException } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from 'src/prisma/prisma.service';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { OrderStatus, Prisma } from '@prisma/client';
import { EventType } from '../const/eventTypes';

@Controller()
export class StockConsumer {
  private readonly logger = new Logger(StockConsumer.name);

  constructor(private readonly prisma: PrismaService) {}

  @EventPattern(EventType.PAYMENT_PROCESSED)
  async handleStockUpdated(@Payload() data: any) {
    const orderId = data.orderId;

    this.logger.log(`Iniciando transação de estoque para pedido ${orderId}`);

    try {
      await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { orderItems: true },
        });

        if (!order) {
          throw new NotFoundException(`${MESSAGES.ORDER.NOT_FOUND} ${orderId}`);
        }

        // BLOQUEIA todos os produtos do pedido (FOR UPDATE)
        const productIds = order.orderItems.map((item) => item.productId);
        const lockedProducts = await tx.$queryRaw<
          { id: number; stock: number }[]
        >(Prisma.sql`
          SELECT id, stock
          FROM "Product"
          WHERE id IN (${Prisma.join(productIds)})
          FOR UPDATE
        `);

        let hasError = false;

        for (const item of order.orderItems) {
          const product = lockedProducts.find((p) => p.id === item.productId);
          if (!product) {
            this.logger.warn(`${MESSAGES.PRODUCT.NOT_FOUND} ${item.productId}`);
            hasError = true;
            break;
          }

          if (product.stock < item.quantity) {
            this.logger.warn(
              `${MESSAGES.PRODUCT.INSUFICIENT_STOCK} ${item.productId}`,
            );
            hasError = true;
            break;
          }

          await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: item.quantity } },
          });
        }

        const newStatus = hasError
          ? OrderStatus.CANCELLED
          : OrderStatus.CONFIRMED;

        await tx.order.update({
          where: { id: order.id },
          data: { status: newStatus },
        });

        if (hasError) {
          throw new Error(MESSAGES.PRODUCT.INSUFICIENT_STOCK);
        }

        this.logger.log(`${MESSAGES.ORDER.STOCK_UPDATED} ${order.id}`);
      });
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar estoque do pedido ${data.orderId}: ${error.message}`,
      );

      throw error;
    }
  }
}
