import { Product as PrismaProduct } from '@prisma/client';

export class Product implements PrismaProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cost: number | null;
  stock: number;
  minStock: number;
  category: string | null;
  sku: string | null;
  barcode: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  gymId: string;
}