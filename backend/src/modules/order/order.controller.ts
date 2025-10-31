import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './createOrder.dto';
import { GetOrdersFilterDto } from './getOrderFilter.dto';

@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  async getOrders(@Query() filters: GetOrdersFilterDto) {
    return this.orderService.getOrdersWithFilters(filters);
  }

  @Get(':id')
  async getOrderById(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.getOrderById(id);
  }

  @Post()
  async createOrder(@Body() data: CreateOrderDto) {
    return this.orderService.createOrder(data);
  }
}
