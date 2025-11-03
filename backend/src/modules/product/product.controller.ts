import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDTO } from './createProduct.dto';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { Roles } from 'src/common/guards/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('product')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get(':id')
  @Roles('ADMIN', 'USER')
  async getProductById(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productService.getProductById(id);
    if (!product) {
      throw new NotFoundException(MESSAGES.PRODUCT.NOT_FOUND);
    }

    return product;
  }

  @Get()
  @Roles('ADMIN', 'USER')
  async getAllProducts() {
    return await this.productService.getAllProducts();
  }

  @Post()
  @Roles('ADMIN')
  async createProduct(@Body() data: CreateProductDTO) {
    return await this.productService.createProduct(data);
  }

  @Put(':id')
  @Roles('ADMIN')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<CreateProductDTO>,
  ) {
    const product = await this.productService.updateProduct(id, data);
    if (!product) {
      throw new NotFoundException(MESSAGES.PRODUCT.NOT_FOUND);
    }

    return product;
  }
}
