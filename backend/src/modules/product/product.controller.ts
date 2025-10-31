import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDTO } from './createProduct.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get(':id')
  async getProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getProductById(id);
  }

  @Get()
  async getAllProducts() {
    return this.productService.getAllProducts();
  }

  @Post()
  async createProduct(@Body() data: CreateProductDTO) {
    return this.productService.createProduct(data);
  }

  @Put(':id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<CreateProductDTO>,
  ) {
    return this.productService.updateProduct(id, data);
  }
}
