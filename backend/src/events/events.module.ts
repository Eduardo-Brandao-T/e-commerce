import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DlqConsumer } from './consumer/dlq.consumer';
import { PaymentConsumer } from './consumer/payment.consumer';
import { StockConsumer } from './consumer/stock.consumer';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { EventsController } from './events.controller';

@Module({
  controllers: [EventsController, PaymentConsumer, StockConsumer, DlqConsumer],
  providers: [
    {
      provide: 'RABBITMQ_SERVICE',
      useFactory: (configService: ConfigService) => {
        const rabbitUrl =
          configService.get('RABBITMQ_URL') ||
          'amqp://admin:admin@rabbitmq:5672';
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [rabbitUrl],
            queue: 'app_events',
            queueOptions: {
              durable: true,
            },
          },
        });
      },
      inject: [ConfigService],
    },
    EventsService,
    PrismaService,
  ],
  exports: [EventsService],
})
export class EventsModule {}
