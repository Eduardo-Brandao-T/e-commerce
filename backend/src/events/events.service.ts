import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EventType } from './const/eventTypes';

@Injectable()
export class EventsService {
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  emit(event: EventType, payload: any) {
    return this.client.emit(event, payload);
  }

  getRetryCount(msg: any): number {
    const death = msg.properties.headers['x-death'];
    if (death && death.length > 0) {
      return death[0].count || 0;
    }
    return 0;
  }

  requeueWithDelay(channel, msg, delay: number) {
    channel.sendToQueue('app_events_retry', msg.content, {
      headers: msg.properties.headers,
      expiration: delay.toString(),
    });
  }
}
