import { IsInt, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { MESSAGES } from 'src/common/constants/messages.constants';

export class OrderItemDto {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1, { message: MESSAGES.ORDER.INVALID_ITEM_VALUE })
  quantity: number;
}

export class CreateOrderDto {
  @IsInt()
  userId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
