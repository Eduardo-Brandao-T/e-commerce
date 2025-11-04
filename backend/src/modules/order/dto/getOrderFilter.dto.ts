import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsDateString } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class GetOrdersFilterDto {
  @ApiPropertyOptional({ example: 1, description: 'Filtrar por ID do pedido' })
  @IsOptional()
  @IsInt()
  orderId?: number;

  @ApiPropertyOptional({ example: 3, description: 'Filtrar por ID do usuário' })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({
    enum: OrderStatus,
    description: 'Filtrar por status do pedido',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    example: '2025-11-01',
    description: 'Filtrar pedidos após essa data (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2025-11-03',
    description: 'Filtrar pedidos antes dessa data (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Número da página (paginação)',
  })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Quantidade de registros por página',
  })
  @IsOptional()
  @IsInt()
  limit?: number;

  @ApiPropertyOptional({
    example: 'createdAt:desc',
    description: 'Ordenação (campo:direção)',
  })
  @IsOptional()
  sort?: string;
}
