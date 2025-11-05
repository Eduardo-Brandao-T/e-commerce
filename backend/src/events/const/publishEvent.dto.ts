import { ApiProperty } from '@nestjs/swagger';
import { EventType } from './eventTypes';

export class PublishEventDto {
  @ApiProperty({
    enum: EventType,
    description:
      'Para testar payment.consumer: ORDER_CREATED e para stockConsumer: PAYMENT_PROCESSED',
    example: EventType.PAYMENT_PROCESSED,
  })
  type: EventType;

  @ApiProperty({
    description: 'Conteúdo do evento (nesse caso sempre será orderId: ${id})',
    example: {
      orderId: 1,
    },
  })
  payload: any;
}
