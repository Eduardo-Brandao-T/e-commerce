import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { MESSAGES } from 'src/common/constants/messages.constants';

export class CreateProductDTO {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0, { message: MESSAGES.PRODUCT.INVALID_PRICE_VALUE })
  price: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0, { message: MESSAGES.PRODUCT.INVALID_STOCK_VALUE })
  stock?: number;
}
