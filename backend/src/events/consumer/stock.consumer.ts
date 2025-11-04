import { Controller, Logger, NotFoundException } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { PrismaService } from 'src/prisma/prisma.service';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { OrderStatus, Prisma } from '@prisma/client';
import { EventType } from '../const/eventTypes';
import { EventsService } from '../events.service';

@Controller()
export class StockConsumer {
  private readonly logger = new Logger(StockConsumer.name);
  private readonly maxRetries = 5;
  private readonly baseDelay = 5000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  @EventPattern(EventType.PAYMENT_PROCESSED)
  async handleStockUpdated(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const msg = context.getMessage();
    const orderId = data.orderId;

    this.logger.log(`Iniciando transação de estoque para pedido ${orderId}`);

    try {
      await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { orderItems: true },
        });

        if (!order)
          throw new NotFoundException(`${MESSAGES.ORDER.NOT_FOUND} ${orderId}`);

        // bloqueia produtos (FOR UPDATE)
        const productIds = order.orderItems.map((i) => i.productId);
        const lockedProducts = await tx.$queryRaw<
          { id: number; stock: number }[]
        >(Prisma.sql`
          SELECT id, stock FROM "Product" WHERE id IN (${Prisma.join(productIds)}) FOR UPDATE
        `);

        let hasError = false;

        for (const item of order.orderItems) {
          const product = lockedProducts.find((p) => p.id === item.productId);
          if (!product || product.stock < item.quantity) {
            hasError = true;
            break;
          }

          await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: item.quantity } },
          });
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: hasError ? OrderStatus.CANCELLED : OrderStatus.CONFIRMED,
          },
        });

        if (hasError) throw new Error(MESSAGES.PRODUCT.INSUFICIENT_STOCK);
      });

      this.logger.log(`${MESSAGES.ORDER.STOCK_UPDATED} ${orderId}`);
    } catch (error) {
      const retryCount = this.eventsService.getRetryCount(msg);
      this.logger.warn(
        `Erro no estoque do pedido ${orderId} (tentativa ${retryCount + 1}): ${error.message}`,
      );

      if (retryCount < this.maxRetries) {
        const delay = this.baseDelay * Math.pow(2, retryCount);
        this.eventsService.requeueWithDelay(channel, msg, delay);
      } else {
        this.logger.error(
          `Max retries atingido, enviando para DLQ: pedido ${orderId}`,
        );
        channel.sendToQueue('app_events_dlq', msg.content, {
          headers: msg.properties.headers,
        });
      }

      channel.ack(msg);
    }
  }
}
