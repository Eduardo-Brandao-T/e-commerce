import { ApiProperty } from '@nestjs/swagger';
import { ActionType, EntityType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateLogDTO {
  @ApiProperty({ enum: EntityType })
  @IsEnum(EntityType)
  entity: EntityType;

  @Type(() => Number)
  @ApiProperty({ example: 123 })
  @IsInt()
  performedById: number;

  @Type(() => Number)
  @ApiProperty({ example: 123 })
  @IsInt()
  entityId: number;

  @ApiProperty({ enum: ActionType })
  @IsEnum(ActionType)
  action: ActionType;

  @ApiProperty({ example: 'price', required: false })
  @IsOptional()
  @IsString()
  field?: string;

  @ApiProperty({ example: '79.90', required: false })
  @IsOptional()
  @IsString()
  oldValue?: string;

  @ApiProperty({ example: '89.90', required: false })
  @IsOptional()
  @IsString()
  newValue?: string;

  @ApiProperty({ example: 'Preço do produto atualizado', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
