import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventType } from './const/eventTypes';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublishEventDto } from './const/publishEvent.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/guards/roles.decorator';

@ApiTags('Events')
@ApiBearerAuth('access-token')
@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('publish')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Publica mensagem customizável' })
  @ApiBody({ type: PublishEventDto })
  publish(@Body() body: { type: EventType; payload: any }) {
    this.eventsService.emit(body.type, body.payload);
    return { message: `Evento ${body.type} publicado com sucesso!` };
  }
}
