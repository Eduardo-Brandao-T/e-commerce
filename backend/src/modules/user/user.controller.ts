import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './createUser.dto';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { Roles } from 'src/common/guards/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { Public } from 'src/common/guards/public.decorator';
import { User } from '@prisma/client';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @Public()
  async getAllUsers(): Promise<User[]> {
    return await this.userService.getAllUsers();
  }

  @Get(':id')
  @Roles('ADMIN')
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException(MESSAGES.CUSTOMER.NOT_FOUND);
    }
    return user;
  }

  @Post()
  @Roles('USER', 'ADMIN')
  async createUser(@Body() data: CreateUserDTO): Promise<User | null> {
    return await this.userService.createUser(data);
  }

  @Put(':id')
  @Roles('USER', 'ADMIN')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<CreateUserDTO>,
  ): Promise<User> {
    const user = await this.userService.updateUser(id, data);
    if (!user) {
      throw new NotFoundException(MESSAGES.CUSTOMER.NOT_FOUND);
    }
    return user;
  }
}
