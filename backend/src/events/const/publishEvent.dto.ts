import { ApiProperty } from '@nestjs/swagger';
import { EventType } from './eventTypes';

export class PublishEventDto {
  @ApiProperty({ enum: EventType, example: EventType.PAYMENT_PROCESSED })
  type: EventType;

  @ApiProperty({
    description: 'Conteúdo do evento (payload)',
    example: {
      orderId: 1,
    },
  })
  payload: any;
}
