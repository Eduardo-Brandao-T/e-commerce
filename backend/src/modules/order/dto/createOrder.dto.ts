import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { MESSAGES } from 'src/common/constants/messages.constants';

export class OrderItemDto {
  @ApiProperty({ example: 1, description: 'ID do produto' })
  @IsInt()
  productId: number;

  @ApiProperty({
    example: 2,
    description: 'Quantidade do produto no pedido (mínimo 1)',
  })
  @IsInt()
  @Type(() => Number)
  @Min(1, { message: MESSAGES.ORDER.INVALID_ITEM_VALUE })
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 3, description: 'ID do usuário que fez o pedido' })
  @IsInt()
  userId: number;

  @ApiProperty({
    description: 'Lista de itens do pedido',
    type: [OrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
