import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { EventType } from './eventTypes';

@Injectable()
export class EventsService {
  private client: ClientProxy;

  constructor(private readonly configService: ConfigService) {
    const rabbitUrl =
      this.configService.get<string>('RABBITMQ_URL') ||
      'amqp://guest:guest@localhost:5672';

    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitUrl],
        queue: 'app_events',
        queueOptions: {
          durable: true,
          deadLetterExchange: '',
          deadLetterRoutingKey: 'app_events_dlq',
        },
      },
    });
  }

  emit(event: EventType, payload: any) {
    this.client.emit(event, payload);
  }
}
