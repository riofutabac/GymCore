import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RenewMembershipDto } from './dto/renew-membership.dto';
import { MembershipStatus } from '@prisma/client';

@Injectable()
export class MembershipsService {
  constructor(private prisma: PrismaService) {}

  async getMyMembership(userId: string) {
    try {
      console.log('🎫 [MEMBERSHIP] Getting membership for user:', userId);
      
      let membership = await this.prisma.membership.findUnique({
        where: { userId: userId },
        include: {
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });

      if (!membership) {
        console.log('🎫 [MEMBERSHIP] No membership found, creating default one');
        
        // Crear membresía por defecto si no existe
        membership = await this.prisma.membership.create({
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
        
        console.log('🎫 [MEMBERSHIP] Created default membership:', membership);
      }
      
      return {
        success: true,
        data: membership,
      };
    } catch (error) {
      console.error('Error getting membership:', error);
      throw new Error('Error al obtener la membresía');
    }
  }

  async renew(userId: string, renewMembershipDto: RenewMembershipDto) {
    try {
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

      const updatedMembership = await this.prisma.membership.update({
        where: { id: membership.id },
        data: {
          status: MembershipStatus.ACTIVE,
          expiresAt: newExpirationDate,
          lastPayment: new Date(),
          totalPaid: membership.totalPaid + renewMembershipDto.amount,
        },
      });

      return {
        success: true,
        message: 'Membresía renovada exitosamente',
        data: updatedMembership
      };
    } catch (error) {
      console.error('Error renewing membership:', error);
      throw error;
    }
  }

  async suspend(membershipId: string) {
    try {
      const membership = await this.prisma.membership.findUnique({
        where: { id: membershipId },
      });

      if (!membership) {
        throw new NotFoundException(`Membresía con ID "${membershipId}" no encontrada.`);
      }

      const updatedMembership = await this.prisma.membership.update({
        where: { id: membershipId },
        data: {
          status: MembershipStatus.SUSPENDED,
        },
      });

      return {
        success: true,
        message: 'Membresía suspendida exitosamente',
        data: updatedMembership
      };
    } catch (error) {
      console.error('Error suspending membership:', error);
      throw error;
    }
  }

  async getAllMemberships(gymId?: string) {
    try {
      let whereClause = {};
      
      if (gymId) {
        whereClause = {
          user: {
            OR: [
              { memberOfGymId: gymId },
              { staffOfGymId: gymId }
            ]
          }
        };
      }

      const memberships = await this.prisma.membership.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            }
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: memberships,
      };
    } catch (error) {
      console.error('Error getting all memberships:', error);
      throw new Error('Error al obtener las membresías');
    }
  }
}