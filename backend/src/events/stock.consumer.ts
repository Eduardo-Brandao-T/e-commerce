import { Controller, Logger, NotFoundException } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventType } from './eventTypes';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { OrderStatus } from '@prisma/client';

@Controller()
export class StockConsumer {
  private readonly logger = new Logger(StockConsumer.name);

  constructor(private readonly prisma: PrismaService) {}

  @EventPattern(EventType.PAYMENT_PROCESSED)
  async handleStockUpdated(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const orderId = data.orderId;
      this.logger.log(`Atualizando estoque para pedido ${orderId}`);
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });

      if (!order)
        throw new NotFoundException(`${MESSAGES.ORDER.NOT_FOUND} ${orderId}`);

      let hasError = false;

      for (const item of order.orderItems) {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });

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

        await this.prisma.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity },
        });
      }

      const newStatus = hasError
        ? OrderStatus.CANCELLED
        : OrderStatus.CONFIRMED;
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: newStatus },
      });

      this.logger.log(
        hasError
          ? `${MESSAGES.ORDER.STOCK_ERROR} ${order.id}`
          : `${MESSAGES.ORDER.STOCK_UPDATED} ${order.id}`,
      );

      channel.ack(originalMsg);
    } catch (error) {
      const retryCount = (originalMsg.properties.headers['x-retry'] || 0) + 1;
      const maxRetries = 5;

      if (retryCount <= maxRetries) {
        const backoff = 1000 * Math.pow(2, retryCount - 1);
        this.logger.warn(
          `${retryCount} tentativas em ${backoff}ms: ${error.message}`,
        );

        channel.publish('', 'app_events', originalMsg.content, {
          headers: { 'x-retry': retryCount },
          expiration: backoff,
        });
        channel.ack(originalMsg);
      } else {
        this.logger.error(
          `Número máximo de tentativas excedido. Enviando para DLQ: ${error.message}`,
        );
        channel.nack(originalMsg, false, false);
      }
    }
  }
}
