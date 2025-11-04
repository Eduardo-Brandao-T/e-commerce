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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDTO } from './dto/createProduct.dto';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { Roles } from 'src/common/guards/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UpdateProductDTO } from './dto/updateProduct.dto';

@ApiTags('Products')
@Controller('product')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get(':id')
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Busca produto pelo ID' })
  @ApiResponse({
    status: 200,
    description: 'Produto encontrado',
    schema: {
      example: {
        id: 1,
        name: 'Camisa Polo',
        description: 'Camisa de algodão tamanho M',
        price: 79.9,
        stock: 10,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async getProductById(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productService.getProductById(id);
    if (!product) throw new NotFoundException(MESSAGES.PRODUCT.NOT_FOUND);
    return product;
  }

  @Get()
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Lista todos os produtos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos retornada com sucesso',
    schema: {
      example: [
        {
          id: 1,
          name: 'Camisa Polo',
          price: 79.9,
          stock: 10,
        },
      ],
    },
  })
  async getAllProducts() {
    return await this.productService.getAllProducts();
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cria um novo produto' })
  @ApiBody({ type: CreateProductDTO })
  @ApiResponse({
    status: 201,
    description: 'Produto criado com sucesso',
    schema: {
      example: {
        id: 5,
        name: 'Calça Jeans',
        price: 129.9,
        stock: 25,
      },
    },
  })
  async createProduct(@Body() data: CreateProductDTO) {
    return await this.productService.createProduct(data);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualiza um produto existente' })
  @ApiBody({ type: UpdateProductDTO })
  @ApiResponse({
    status: 200,
    description: 'Produto atualizado com sucesso',
    schema: {
      example: {
        id: 1,
        name: 'Camisa Polo Slim',
        price: 89.9,
        stock: 12,
      },
    },
  })
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateProductDTO,
  ) {
    const product = await this.productService.updateProduct(id, data);
    if (!product) throw new NotFoundException(MESSAGES.PRODUCT.NOT_FOUND);
    return product;
  }
}
