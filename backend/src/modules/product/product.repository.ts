import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ProductRepository {
  constructor(private prismaService: PrismaService) {}

  async findProductById(id: number) {
    return this.prismaService.product.findUnique({
      where: { id },
    });
  }

  async findAllProducts() {
    return this.prismaService.product.findMany();
  }

  async createProduct(data: Prisma.ProductCreateInput) {
    return this.prismaService.product.create({
      data,
    });
  }

  async updateProduct(id: number, data: Prisma.ProductUpdateInput) {
    return this.prismaService.product.update({
      where: { id },
      data,
    });
  }
}
