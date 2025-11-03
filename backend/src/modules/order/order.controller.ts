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
import { OrderService } from './order.service';
import { CreateOrderDto } from './createOrder.dto';
import { GetOrdersFilterDto } from './getOrderFilter.dto';
import { Roles } from 'src/common/guards/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('order')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  @Roles('ADMIN')
  async getOrders(@Query() filters: GetOrdersFilterDto) {
    return await this.orderService.getOrdersWithFilters(filters);
  }

  @Get(':userId')
  @Roles('ADMIN', 'USER')
  async getOrdersByUserId(@Param('userId', ParseIntPipe) id: number) {
    return await this.orderService.getOrdersByUserId(id);
  }

  @Post()
  @Roles('ADMIN', 'USER')
  async createOrder(@Body() data: CreateOrderDto) {
    return await this.orderService.createOrder(data);
  }
}
