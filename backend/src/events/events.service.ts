import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { EventType } from './eventTypes';

@Injectable()
export class EventsService {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@localhost:5672'],
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
