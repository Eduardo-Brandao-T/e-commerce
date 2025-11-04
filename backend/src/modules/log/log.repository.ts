import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LogRepository {
  constructor(private prismaService: PrismaService) {}

  async createLog(data: Prisma.LogCreateInput) {
    return this.prismaService.log.create({ data });
  }
}
