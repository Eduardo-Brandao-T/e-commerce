import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { PaymentConsumer } from './payment.consumer';
import { StockConsumer } from './stock.consumer';
import { PrismaService } from 'prisma/prisma.service';
import { DlqConsumer } from './dlq.consumer';

@Module({
  providers: [
    EventsService,
    PaymentConsumer,
    StockConsumer,
    DlqConsumer,
    PrismaService,
  ],
  exports: [EventsService],
})
export class EventsModule {}
