import { Gym as PrismaGym } from '@prisma/client';

export class Gym implements PrismaGym {
  id: number;
  joinCode: string;
  createdAt: Date;
  updatedAt: Date;
  // Add other fields from your Prisma Gym model here
  // For example:
  // name: string;
  // description: string | null;
}