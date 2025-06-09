import { Membership as PrismaMembership } from '@prisma/client';

export class Membership implements PrismaMembership {
  id: string;
  userId: string;
  gymId: string;
  startDate: Date;
  endDate: Date;
  state: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;

  // Add any additional methods or properties you need for the entity
}