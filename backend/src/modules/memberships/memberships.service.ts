import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RenewMembershipDto } from './dto/renew-membership.dto';
import { MembershipStatus } from '@prisma/client';

@Injectable()
export class MembershipsService {
  constructor(private prisma: PrismaService) {}

  async renew(userId: string, renewMembershipDto: RenewMembershipDto) {
    const paymentSuccessful = this.simulatePayment(renewMembershipDto.paymentInfo);

    if (!paymentSuccessful) {
      throw new Error('Payment failed.');
    }

    const membership = await this.prisma.membership.findUnique({
      where: { userId: userId },
    });

    if (!membership) {
      throw new NotFoundException(`Membership for user with ID "${userId}" not found.`);
    }

    const newExpirationDate = new Date();
    newExpirationDate.setMonth(newExpirationDate.getMonth() + 1);

    // Create payment record
    await this.prisma.payment.create({
      data: {
        amount: renewMembershipDto.amount,
        method: renewMembershipDto.paymentMethod as any,
        status: 'COMPLETED',
        description: renewMembershipDto.description,
        membershipId: membership.id,
      },
    });

    return this.prisma.membership.update({
      where: { id: membership.id },
      data: {
        status: MembershipStatus.ACTIVE,
        expiresAt: newExpirationDate,
        lastPayment: new Date(),
        totalPaid: membership.totalPaid + renewMembershipDto.amount,
      },
    });
  }

  async suspend(userId: string) {
    const membership = await this.prisma.membership.findUnique({
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
    const membership = await this.prisma.membership.findUnique({
      where: { userId: userId },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException(`Membership for user with ID "${userId}" not found.`);
    }
    return membership;
  }

  private simulatePayment(paymentInfo: any): boolean {
    console.log('Simulating payment with info:', paymentInfo);
    return true;
  }
}