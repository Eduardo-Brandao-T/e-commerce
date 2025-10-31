import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CustomerRepository {
  constructor(private prismaService: PrismaService) {}

  async findCustomerById(id: number) {
    return this.prismaService.customer.findUnique({
      where: { id },
    });
  }

  async createCustomer(data: Prisma.CustomerCreateInput) {
    return this.prismaService.customer.create({
      data,
    });
  }

  async updateCustomer(id: number, data: Prisma.CustomerUpdateInput) {
    return this.prismaService.customer.update({
      where: { id },
      data,
    });
  }
}
