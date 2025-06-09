import { Sale as PrismaSale } from '@prisma/client';

export class Sale implements PrismaSale {
  id: string;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  notes: string | null;
  createdAt: Date;
  sellerId: string;
  gymId: string;
}