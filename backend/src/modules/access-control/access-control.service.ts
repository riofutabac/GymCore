import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ValidateQRDto } from './dto/validate-qr.dto';
import { AccessType, AccessStatus } from '@prisma/client';

@Injectable()
export class AccessControlService {
  constructor(private prisma: PrismaService) {}

  async validateQR(validateQRDto: ValidateQRDto, validatorId: string) {
    const { qrData } = validateQRDto;
    
    const [userId, timestamp] = qrData.split('-');
    
    if (!userId || !timestamp) {
      throw new BadRequestException('Invalid QR code format');
    }

    const qrTimestamp = parseInt(timestamp);
    const now = Date.now();
    const thirtySeconds = 30 * 1000;
    
    if (now - qrTimestamp > thirtySeconds) {
      throw new BadRequestException('QR code has expired');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        membership: true,
        memberOfGym: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.membership || user.membership.status !== 'ACTIVE') {
      await this.prisma.accessLog.create({
        data: {
          type: AccessType.QR_CODE,
          status: AccessStatus.DENIED,
          method: 'QR_SCAN',
          userId: userId,
          gymId: user.memberOfGymId || '',
        },
      });

      return {
        access: 'DENIED',
        reason: 'Membership not active',
        user: {
          name: user.name,
          email: user.email,
        },
      };
    }

    await this.prisma.accessLog.create({
      data: {
        type: AccessType.QR_CODE,
        status: AccessStatus.GRANTED,
        method: 'QR_SCAN',
        userId: userId,
        gymId: user.memberOfGymId || '',
      },
    });

    return {
      access: 'GRANTED',
      user: {
        name: user.name,
        email: user.email,
        membershipStatus: user.membership.status,
        expiresAt: user.membership.expiresAt,
      },
    };
  }
}