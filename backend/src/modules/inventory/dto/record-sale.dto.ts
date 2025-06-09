export class RecordSaleDto {
  total: number;
  subtotal: number;
  tax?: number;
  discount?: number;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}