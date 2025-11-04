import { Body, Controller, Post } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventType } from './const/eventTypes';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PublishEventDto } from './const/publishEvent.dto';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('publish')
  @ApiOperation({ summary: 'Publica mensagem customizável' })
  @ApiBody({ type: PublishEventDto })
  publish(@Body() body: { type: EventType; payload: any }) {
    this.eventsService.emit(body.type, body.payload);
    return { message: `Evento ${body.type} publicado com sucesso!` };
  }

  @ApiOperation({ summary: 'Publica mensagem padrão' })
  @Post('payment')
  testPaymentEvent() {
    this.eventsService.emit(EventType.PAYMENT_PROCESSED, { orderId: 1 });
    return { message: 'Evento PAYMENT_PROCESSED enviado!' };
  }
}
