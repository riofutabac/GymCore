import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RenewMembershipDto } from './dto/renew-membership.dto';
import { MembershipStatus } from '@prisma/client';

@Injectable()
export class MembershipsService {
  constructor(private prisma: PrismaService) {}

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
      // Crear membresía por defecto si no existe
      const newMembership = await this.prisma.membership.create({
        data: {
          userId,
          type: 'MONTHLY',
          status: 'ACTIVE',
          startDate: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
          monthlyPrice: 50.00,
          totalPaid: 0,
          autoRenewal: false,
        },
        include: {
          payments: true,
        },
      });
      
      return {
        success: true,
        data: newMembership,
      };
    }
    
    return {
      success: true,
      data: membership,
    };
  }

  async renew(userId: string, renewMembershipDto: RenewMembershipDto) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId: userId },
    });

    if (!membership) {
      throw new NotFoundException(`Membresía para usuario con ID "${userId}" no encontrada.`);
    }

    const newExpirationDate = new Date();
    newExpirationDate.setMonth(newExpirationDate.getMonth() + 1);

    // Crear registro de pago
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

  async suspend(membershipId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { id: membershipId },
    });

    if (!membership) {
      throw new NotFoundException(`Membresía con ID "${membershipId}" no encontrada.`);
    }

    return this.prisma.membership.update({
      where: { id: membershipId },
      data: {
        status: MembershipStatus.SUSPENDED,
      },
    });
  }
}