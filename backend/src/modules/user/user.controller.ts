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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { Roles } from 'src/common/guards/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { Public } from 'src/common/guards/public.decorator';
import { User } from '@prisma/client';
import { CreateUserDTO } from './dto/createUser.dto';
import { UpdateUserDTO } from './dto/updateUser.dto';

@ApiTags('Users')
@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @Public()
  @ApiOperation({ summary: 'Lista todos os usuários' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    schema: {
      example: [
        {
          id: 1,
          name: 'Eduardo Brandão',
          email: 'eduardo@email.com',
          document: '12345678912',
        },
      ],
    },
  })
  async getAllUsers(): Promise<User[]> {
    return await this.userService.getAllUsers();
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Busca um usuário pelo ID' })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado',
    schema: {
      example: {
        id: 1,
        name: 'Eduardo Brandão',
        email: 'eduardo@email.com',
        document: '12345678912',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    const user = await this.userService.getUserById(id);
    if (!user) throw new NotFoundException(MESSAGES.CUSTOMER.NOT_FOUND);
    return user;
  }

  @Post()
  @Roles('USER', 'ADMIN')
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiBody({ type: CreateUserDTO })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    schema: {
      example: {
        id: 5,
        name: 'Novo Usuario',
        email: 'novo@email.com',
        document: '98765432100',
      },
    },
  })
  async createUser(@Body() data: CreateUserDTO): Promise<User | null> {
    return await this.userService.createUser(data);
  }

  @Put(':id')
  @Roles('USER', 'ADMIN')
  @ApiOperation({ summary: 'Atualiza um usuário existente' })
  @ApiBody({ type: UpdateUserDTO })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso',
    schema: {
      example: {
        id: 1,
        name: 'Eduardo Atualizado',
        email: 'eduardo@email.com',
        document: '12345678912',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserDTO,
  ): Promise<User> {
    const user = await this.userService.updateUser(id, data);
    if (!user) throw new NotFoundException(MESSAGES.CUSTOMER.NOT_FOUND);
    return user;
  }
}
