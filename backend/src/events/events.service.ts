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
}
