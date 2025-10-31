import { IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDTO {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsInt()
  stock?: number;
}
