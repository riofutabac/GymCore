export class CreateProductDto {
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  category?: string;
  sku?: string;
  barcode?: string;
}