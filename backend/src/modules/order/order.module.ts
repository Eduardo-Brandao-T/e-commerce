import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderRepository } from './order.repository';
import { OrderService } from './order.service';
import { ProductModule } from '../product/product.module';
import { EventsModule } from 'src/events/events.module';
import { LogModule } from '../log/log.module';

@Module({
  imports: [ProductModule, EventsModule, LogModule],
  controllers: [OrderController],
  providers: [OrderRepository, OrderService],
})
export class OrderModule {}
