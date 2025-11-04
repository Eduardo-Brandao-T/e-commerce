import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller()
export class DlqConsumer {
  private readonly logger = new Logger(DlqConsumer.name);

  constructor(private readonly prisma: PrismaService) {}

  @EventPattern('app_events_dlq')
  async handleDlq(@Payload() message: any) {
    try {
      const { event, data, error } = message;

      await this.prisma.eventFailure.create({
        data: {
          eventType: event || 'UNKNOWN',
          payload: data || {},
          error: error || MESSAGES.EVENTS.UNKNOWN_ERROR,
        },
      });

      this.logger.error(`Mensagem DLQ salva: evento=${event}, erro=${error}`);
    } catch (err) {
      this.logger.error('Falha ao salvar mensagem DLQ', err as any);
    }
  }
}
