import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrderRepository {
  constructor(private prismaService: PrismaService) {}

  async findManyOrders(params: Prisma.OrderFindManyArgs) {
    return this.prismaService.order.findMany(params);
  }

  async findOrderById(id: number) {
    return this.prismaService.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });
  }

  async createOrder(data: Prisma.OrderCreateInput) {
    return this.prismaService.order.create({
      data,
      include: { orderItems: true },
    });
  }
}
