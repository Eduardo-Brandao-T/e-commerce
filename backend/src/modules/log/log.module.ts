import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LogService } from './log.service';
import { LogRepository } from './log.repository';

@Module({
  providers: [LogService, LogRepository, PrismaService],
  exports: [LogService],
})
export class LogModule {}
