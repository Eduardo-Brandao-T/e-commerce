import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDTO } from './createCustomer.dto';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get(':id')
  async getCustomerById(@Param('id', ParseIntPipe) id: number) {
    return this.customerService.getCustomerById(id);
  }

  @Post()
  async createCustomer(@Body() data: CreateCustomerDTO) {
    return this.customerService.createCustomer(data);
  }

  @Put(':id')
  async updateCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<CreateCustomerDTO>,
  ) {
    return this.customerService.updateCustomer(id, data);
  }
}
