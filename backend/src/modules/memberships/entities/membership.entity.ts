import { Membership as PrismaMembership, MembershipStatus } from '@prisma/client';

export class Membership implements PrismaMembership {
  id: string;
  type: string;
  status: MembershipStatus;
  startDate: Date | null;
  expiresAt: Date | null;
  lastPayment: Date | null;
  monthlyPrice: number | null;
  totalPaid: number;
  autoRenewal: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  legacyUserId: string | null;
}