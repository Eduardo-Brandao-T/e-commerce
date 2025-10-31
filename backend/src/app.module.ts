import { Module } from '@nestjs/common';
import { CustomerModule } from './modules/customer/customer.module';
import { PrismaModule } from 'prisma/prisma.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    PrismaModule,
    CustomerModule,
    ProductModule,
    OrderModule,
    EventsModule,
  ],
})
export class AppModule {}
