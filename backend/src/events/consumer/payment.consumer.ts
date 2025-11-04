import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { EventsService } from '../events.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventType } from '../const/eventTypes';
import { OrderStatus } from '@prisma/client';

@Controller()
export class PaymentConsumer {
  private readonly logger = new Logger(PaymentConsumer.name);
  private readonly maxRetries = 5;
  private readonly baseDelay = 5000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  @EventPattern(EventType.ORDER_CREATED)
  async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const orderId = data.orderId;

    try {
      this.logger.log(`Processando pagamento para pedido ${orderId}`);

      const paymentResult = await this.simulateExternalPayment(orderId);

      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: paymentResult.status },
      });

      if (paymentResult.status === OrderStatus.PAYMENT_CONFIRMED) {
        this.eventsService.emit(EventType.PAYMENT_PROCESSED, { orderId });
        this.logger.log(`Pagamento confirmado para pedido ${orderId}`);
      } else {
        this.logger.warn(`Falha no pagamento do pedido ${orderId}`);
        throw new Error('Falha no pagamento — simulação');
      }
    } catch (error) {
      const retryCount = this.eventsService.getRetryCount(originalMsg);
      this.logger.warn(
        `Erro ao processar pagamento ${orderId} (tentativa ${retryCount + 1}): ${error.message}`,
      );

      if (retryCount < this.maxRetries) {
        const delay = this.baseDelay * Math.pow(2, retryCount);
        this.eventsService.requeueWithDelay(channel, originalMsg, delay);
      } else {
        this.logger.error(
          `Max retries atingido, enviando para DLQ: pedido ${orderId}`,
        );
        channel.sendToQueue('app_events_dlq', originalMsg.content, {
          headers: originalMsg.properties.headers,
        });
      }

      channel.ack(originalMsg);
    }
  }

  private async simulateExternalPayment(
    orderId: number,
  ): Promise<{ success: boolean; status: OrderStatus }> {
    const delay = Math.floor(Math.random() * 3000) + 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const success = Math.random() > 0.3;
    return {
      success,
      status: success
        ? OrderStatus.PAYMENT_CONFIRMED
        : OrderStatus.PAYMENT_FAILED,
    };
  }
}
