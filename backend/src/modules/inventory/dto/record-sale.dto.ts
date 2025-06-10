import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaleItemDto {
  @ApiProperty({
    description: 'ID del producto vendido',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Cantidad vendida',
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario de venta',
  })
  @IsNumber()
  unitPrice: number;
}

export class RecordSaleDto {
  @ApiProperty({
    description: 'Total de la venta (incluyendo impuestos y descuentos)',
  })
  @IsNumber()
  total: number;

  @ApiProperty({
    description: 'Subtotal de la venta (sin impuestos ni descuentos)',
  })
  @IsNumber()
  subtotal: number;

  @ApiPropertyOptional({
    description: 'Impuesto aplicado a la venta',
  })
  @IsOptional()
  @IsNumber()
  tax?: number;

  @ApiPropertyOptional({
    description: 'Descuento aplicado a la venta',
  })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre la venta',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Productos incluidos en la venta',
    type: [SaleItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}