import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Nombre del producto' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Descripción del producto' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Precio de venta del producto' })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ description: 'Costo del producto' })
  @IsOptional()
  @IsNumber()
  cost?: number;

  @ApiProperty({ description: 'Cantidad disponible en inventario' })
  @IsNumber()
  stock: number;

  @ApiPropertyOptional({
    description: 'Cantidad mínima de stock antes de alertar',
  })
  @IsOptional()
  @IsNumber()
  minStock?: number;

  @ApiPropertyOptional({ description: 'Categoría del producto' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Código SKU del producto' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ description: 'Código de barras del producto' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Indica si el producto está activo',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}