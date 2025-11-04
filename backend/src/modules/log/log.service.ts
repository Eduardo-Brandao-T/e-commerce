import { Injectable } from '@nestjs/common';
import { LogRepository } from './log.repository';
import { CreateLogDTO } from './createLog.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LogService {
  constructor(private readonly logRepository: LogRepository) {}

  async createLog(data: CreateLogDTO) {
    const prismaData: Prisma.LogCreateInput = {
      entity: data.entity,
      entityId: data.entityId,
      action: data.action,
      description: data.description,
      performedBy: { connect: { id: data.performedById } },
    };
    return await this.logRepository.createLog(prismaData);
  }
}
