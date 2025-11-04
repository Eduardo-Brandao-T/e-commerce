import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EventsService } from '../events.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventType } from '../const/eventTypes';
import { OrderStatus } from '@prisma/client';

@Controller()
export class PaymentConsumer {
  private readonly logger = new Logger(PaymentConsumer.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsService: EventsService,
  ) {}

  @EventPattern(EventType.ORDER_CREATED)
  async handleOrderCreated(@Payload() data: any) {
    const orderId = data.orderId;

    this.logger.log(`Processando pagamento para pedido ${orderId}`);

    try {
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
      }
    } catch (error) {
      this.logger.error(
        `Erro ao processar pagamento do pedido ${data.orderId}: ${error.message}`,
      );

      throw error;
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
