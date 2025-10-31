import { Module } from '@nestjs/common';
import { CustomerModule } from './modules/customer/customer.module';
import { PrismaModule } from 'prisma/prisma.module';
import { ProductModule } from './modules/product/product.module';

@Module({
  imports: [PrismaModule, CustomerModule, ProductModule],
})
export class AppModule {}
