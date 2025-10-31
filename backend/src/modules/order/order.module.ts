import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderRepository } from './order.repository';
import { OrderService } from './order.service';
import { ProductModule } from '../product/product.module';
import { RabbitMQModule } from 'src/infra/rabbitmq.module';

@Module({
  imports: [ProductModule, RabbitMQModule],
  controllers: [OrderController],
  providers: [OrderRepository, OrderService],
})
export class OrderModule {}
