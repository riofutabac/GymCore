import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserContextService } from '../../common/services/user-context.service';
import { RenewMembershipDto } from './dto/renew-membership.dto';
import { MembershipStatus } from '@prisma/client';

@Injectable()
export class MembershipsService {
  private readonly logger = new Logger(MembershipsService.name);

  constructor(
    private prisma: PrismaService,
    private userContextService: UserContextService,
  ) {}

  async getMyMembership(userId: string) {
    try {
      this.logger.log(`Getting membership for user: ${userId}`);
      
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
        this.logger.log(`No membership found for user ${userId}, creating default one`);
        
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
        
        this.logger.log(`Created default membership for user: ${userId}`);
      }
      
      return {
        success: true,
        data: membership,
      };
    } catch (error) {
      this.logger.error(`Error getting membership for user ${userId}: ${error.message}`, error.stack);
      throw new UnprocessableEntityException('Failed to retrieve membership');
    }
  }

  async renew(userId: string, renewMembershipDto: RenewMembershipDto) {
    try {
      const membership = await this.prisma.membership.findUnique({
        where: { userId: userId },
      });

      if (!membership) {
        throw new NotFoundException(`Membership for user "${userId}" not found`);
      }

      const newExpirationDate = new Date();
      newExpirationDate.setMonth(newExpirationDate.getMonth() + 1);

      const result = await this.prisma.$transaction(async (tx) => {
        // Crear registro de pago
        await tx.payment.create({
          data: {
            amount: renewMembershipDto.amount,
            method: renewMembershipDto.paymentMethod as any,
            status: 'COMPLETED',
            description: renewMembershipDto.description || 'Membership renewal',
            membershipId: membership.id,
          },
        });

        // Actualizar membresía
        const updatedMembership = await tx.membership.update({
          where: { id: membership.id },
          data: {
            status: MembershipStatus.ACTIVE,
            expiresAt: newExpirationDate,
            lastPayment: new Date(),
            totalPaid: membership.totalPaid + renewMembershipDto.amount,
          },
        });

        return updatedMembership;
      });

      this.logger.log(`Membership renewed successfully for user: ${userId}`);
      return {
        success: true,
        message: 'Membership renewed successfully',
        data: result
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error renewing membership for user ${userId}: ${error.message}`, error.stack);
      throw new UnprocessableEntityException('Failed to renew membership');
    }
  }

  async suspend(membershipId: string) {
    try {
      const membership = await this.prisma.membership.findUnique({
        where: { id: membershipId },
      });

      if (!membership) {
        throw new NotFoundException(`Membership "${membershipId}" not found`);
      }

      const updatedMembership = await this.prisma.membership.update({
        where: { id: membershipId },
        data: {
          status: MembershipStatus.SUSPENDED,
        },
      });

      this.logger.log(`Membership suspended successfully: ${membershipId}`);
      return {
        success: true,
        message: 'Membership suspended successfully',
        data: updatedMembership
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error suspending membership ${membershipId}: ${error.message}`, error.stack);
      throw new UnprocessableEntityException('Failed to suspend membership');
    }
  }

  async getAllMemberships(userId: string) {
    try {
      const gymId = await this.userContextService.getUserGymId(userId);

      const memberships = await this.prisma.membership.findMany({
        where: {
          user: {
            OR: [
              { memberOfGymId: gymId },
              { staffOfGymId: gymId }
            ]
          }
        },
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
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error getting all memberships for user ${userId}: ${error.message}`, error.stack);
      throw new UnprocessableEntityException('Failed to retrieve memberships');
    }
  }
}