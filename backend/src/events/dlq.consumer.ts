import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
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
          error: error || 'Unknown error',
        },
      });

      this.logger.error(`DLQ message saved: event=${event}, error=${error}`);
    } catch (err) {
      this.logger.error('Failed to save DLQ message', err as any);
    }
  }
}
