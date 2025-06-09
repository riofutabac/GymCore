import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RenewMembershipDto } from './dto/renew-membership.dto';

enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED',
}

@Injectable()
export class MembershipsService {
  private prisma = new PrismaClient(); // Or inject via constructor

  async renew(userId: string, renewMembershipDto: RenewMembershipDto) {
    // Simulate payment processing (mock)
    const paymentSuccessful = this.simulatePayment(renewMembershipDto.paymentInfo);

    if (!paymentSuccessful) {
      throw new Error('Payment failed.'); // Or a more specific exception
    }

    const membership = await this.prisma.membership.findFirst({
      where: { userId: userId },
    });

    if (!membership) {
      throw new NotFoundException(`Membership for user with ID "${userId}" not found.`);
    }

    // Calculate new expiration date (example: extend by 1 year)
    const newExpirationDate = new Date();
    newExpirationDate.setFullYear(newExpirationDate.getFullYear() + 1);

    return this.prisma.membership.update({
      where: { id: membership.id },
      data: {
        status: MembershipStatus.ACTIVE,
        expiresAt: newExpirationDate,
      },
    });
  }

  async suspend(userId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId: userId },
    });

    if (!membership) {
      throw new NotFoundException(`Membership for user with ID "${userId}" not found.`);
    }

    return this.prisma.membership.update({
      where: { id: membership.id },
      data: {
        status: MembershipStatus.SUSPENDED,
      },
    });
  }

  async getMyMembership(userId: string) {
      const membership = await this.prisma.membership.findFirst({
        where: { userId: userId },
      });

      if (!membership) {
        throw new NotFoundException(`Membership for user with ID "${userId}" not found.`);
      }
      return membership;
  }


  private simulatePayment(paymentInfo: any): boolean {
    // This is a mock implementation. In a real application, you would integrate with a payment gateway.
    console.log('Simulating payment with info:', paymentInfo);
    // For demonstration, let's assume payment is always successful.
    return true;
  }
}