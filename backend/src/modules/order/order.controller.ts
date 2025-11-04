import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { GetOrdersFilterDto } from './dto/getOrderFilter.dto';
import { Roles } from 'src/common/guards/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateOrderDto } from './dto/createOrder.dto';
import { OrderStatus } from '@prisma/client';
import { CurrentUser } from 'src/common/guards/currentUser.decorator';
import type { UserPayload } from '../auth/dto/userPayload.type';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@Controller('order')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Lista todos os pedidos (com filtros)' })
  @ApiResponse({
    status: 200,
    description: 'Pedidos listados com sucesso',
    schema: {
      example: [
        {
          id: 1,
          userId: 3,
          total: 159.8,
          status: OrderStatus.PAYMENT_CONFIRMED,
          items: [{ productId: 1, quantity: 2 }],
        },
      ],
    },
  })
  async getOrders(@Query() filters: GetOrdersFilterDto) {
    return await this.orderService.getOrdersWithFilters(filters);
  }

  @Get(':userId')
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Lista todos os pedidos de um usuário' })
  @ApiResponse({
    status: 200,
    description: 'Pedidos do usuário retornados',
    schema: {
      example: [
        {
          id: 10,
          userId: 2,
          status: OrderStatus.CONFIRMED,
          total: 299.9,
        },
      ],
    },
  })
  async getOrdersByUserId(@Param('userId', ParseIntPipe) id: number) {
    return await this.orderService.getOrdersByUserId(id);
  }

  @Post()
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Cria um novo pedido' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Pedido criado com sucesso',
    schema: {
      example: {
        id: 15,
        userId: 2,
        total: 199.9,
        status: OrderStatus.PAYMENT_CONFIRMED,
        items: [{ productId: 1, quantity: 2 }],
      },
    },
  })
  async createOrder(
    @Body() data: CreateOrderDto,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return await this.orderService.createOrder(data, currentUser);
  }
}
