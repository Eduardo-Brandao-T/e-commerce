import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private prismaService: PrismaService) {}

  async findAllUsers() {
    return this.prismaService.user.findMany();
  }

  async findUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async findUserByDocument(document: string) {
    return this.prismaService.user.findUnique({
      where: { document },
    });
  }

  async findUserById(id: number) {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: Prisma.UserCreateInput) {
    return this.prismaService.user.create({
      data,
    });
  }

  async updateUser(id: number, data: Prisma.UserUpdateInput) {
    return this.prismaService.user.update({
      where: { id },
      data,
    });
  }
}
