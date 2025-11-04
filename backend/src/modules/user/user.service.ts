import { UserRepository } from './user.repository';
import { CreateUserDTO } from './dto/createUser.dto';
import { ConflictException, Injectable } from '@nestjs/common';
import { MESSAGES } from 'src/common/constants/messages.constants';
import * as bcrypt from 'bcrypt';
import { ActionType, EntityType, User } from '@prisma/client';
import type { UserPayload } from '../auth/dto/userPayload.type';
import { LogService } from '../log/log.service';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private logService: LogService,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAllUsers();
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findUserById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findUserByEmail(email);
  }

  async createUser(
    data: CreateUserDTO,
    currentUser: UserPayload,
  ): Promise<User | null> {
    await this.checkConflict(data.document);
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    const userToCreate = { ...data, password: hashedPassword };

    const result = await this.userRepository.createUser(userToCreate);
    if (result) {
      await this.logService.createLog({
        action: ActionType.CREATE,
        entity: EntityType.CUSTOMER,
        entityId: result.id,
        performedById: currentUser.userId,
        description: `User ${result.id} created by ${currentUser.userId}`,
      });
    }

    return result;
  }

  async updateUser(
    id: number,
    data: Partial<CreateUserDTO>,
    currentUser: UserPayload,
  ): Promise<User | null> {
    const result = await this.userRepository.updateUser(id, data);
    if (result) {
      await this.logService.createLog({
        action: ActionType.UPDATE,
        entity: EntityType.CUSTOMER,
        entityId: result.id,
        performedById: currentUser.userId,
        description: `User ${result.id} updated by ${currentUser.userId}`,
      });
    }

    return result;
  }

  private async checkConflict(document: string) {
    const existing = await this.userRepository.findUserByDocument(document);
    if (existing) {
      throw new ConflictException(MESSAGES.CUSTOMER.DUPLICATE_DOCUMENT);
    }
  }
}
