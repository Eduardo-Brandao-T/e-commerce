import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { EventsService } from './events.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventType } from './eventTypes';
import { OrderStatus } from '@prisma/client';

@Controller()
export class PaymentConsumer {
  private readonly logger = new Logger(PaymentConsumer.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  @EventPattern(EventType.ORDER_CREATED)
  async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const orderId = data.orderId;
      this.logger.log(`Processando pagamento para pedido ${orderId}`);
      const paymentResult = await this.simulateExternalPayment(orderId);

      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: paymentResult.status },
      });

      if (paymentResult.status === 'PAYMENT_CONFIRMED') {
        this.eventsService.emit(EventType.PAYMENT_PROCESSED, { orderId });
      }

      this.logger.log(
        paymentResult.success
          ? `Pagamento confirmado para pedido ${orderId}`
          : `Falha no pagamento do pedido ${orderId}`,
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
          `Numéro máximo de tentativas excedido. Enviando para DLQ: ${error.message}`,
        );
        channel.nack(originalMsg, false, false);
      }
    }
  }

  private async simulateExternalPayment(
    orderId: number,
  ): Promise<{ success: boolean; status: OrderStatus }> {
    const delay = Math.floor(Math.random() * 10000) + 5000;
    this.logger.log(
      `Simulando pagamento com delay de ${delay}ms para o pedido ${orderId}`,
    );
    await new Promise((resolve) => setTimeout(resolve, delay));

    const success = Math.random() > 0.2;
    return {
      success,
      status: success
        ? OrderStatus.PAYMENT_CONFIRMED
        : OrderStatus.PAYMENT_FAILED,
    };
  }
}
