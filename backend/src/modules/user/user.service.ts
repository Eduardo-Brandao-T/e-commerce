import { UserRepository } from './user.repository';
import { CreateUserDTO } from './dto/createUser.dto';
import { ConflictException, Injectable } from '@nestjs/common';
import { MESSAGES } from 'src/common/constants/messages.constants';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAllUsers();
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findUserById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findUserByEmail(email);
  }

  async createUser(data: CreateUserDTO): Promise<User | null> {
    await this.checkConflict(data.document);
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    const userToCreate = { ...data, password: hashedPassword };

    return this.userRepository.createUser(userToCreate);
  }

  async updateUser(
    id: number,
    data: Partial<CreateUserDTO>,
  ): Promise<User | null> {
    return this.userRepository.updateUser(id, data);
  }

  private async checkConflict(document: string) {
    const existing = await this.userRepository.findUserByDocument(document);
    if (existing) {
      throw new ConflictException(MESSAGES.CUSTOMER.DUPLICATE_DOCUMENT);
    }
  }
}
