import { Gym as PrismaGym } from '@prisma/client';

export class Gym implements PrismaGym {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  joinCode: string;
  isActive: boolean;
  settings: any;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
}