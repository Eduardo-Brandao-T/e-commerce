import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { MESSAGES } from 'src/common/constants/messages.constants';

export class CreateProductDTO {
  @ApiProperty({ example: 'Camisa Polo', description: 'Nome do produto' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Camisa de algodão tamanho M',
    description: 'Descrição do produto',
    required: false,
  })
  @IsOptional()
  description: string;

  @ApiProperty({
    example: 79.9,
    description: 'Preço do produto',
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0, { message: MESSAGES.PRODUCT.INVALID_PRICE_VALUE })
  price: number;

  @ApiProperty({
    example: 10,
    description: 'Quantidade disponível em estoque',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0, { message: MESSAGES.PRODUCT.INVALID_STOCK_VALUE })
  stock?: number;
}
