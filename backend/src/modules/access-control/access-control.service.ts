import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ValidateQRDto } from './dto/validate-qr.dto';
import { AccessType, AccessStatus } from '@prisma/client';

@Injectable()
export class AccessControlService {
  constructor(private prisma: PrismaService) {}

  async getMyQR(userId: string) {
    try {
      // Verificar que el usuario existe y tiene membresía activa
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          membership: true,
        },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (!user.membership || user.membership.status !== 'ACTIVE') {
        throw new BadRequestException('Membresía no activa');
      }

      // Generar QR dinámico con timestamp
      const qrData = `${userId}-${Date.now()}`;
      
      // Simular imagen QR (en producción usar una librería real como qrcode)
      const qrCodeUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;

      return {
        qrCode: qrCodeUrl,
        qrData,
        expiresIn: 30000, // 30 segundos
        user: {
          name: user.name,
          email: user.email,
          membershipStatus: user.membership.status,
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async validateQR(validateQRDto: ValidateQRDto, validatorId: string) {
    const { qrData } = validateQRDto;
    
    const [userId, timestamp] = qrData.split('-');
    
    if (!userId || !timestamp) {
      throw new BadRequestException('Formato de código QR inválido');
    }

    const qrTimestamp = parseInt(timestamp);
    const now = Date.now();
    const thirtySeconds = 30 * 1000;
    
    if (now - qrTimestamp > thirtySeconds) {
      throw new BadRequestException('Código QR expirado');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        membership: true,
        memberOfGym: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const gymId = user.memberOfGymId || 'default-gym-id';

    if (!user.membership || user.membership.status !== 'ACTIVE') {
      await this.prisma.accessLog.create({
        data: {
          type: AccessType.QR_CODE,
          status: AccessStatus.DENIED,
          method: 'QR_SCAN',
          userId: userId,
          gymId: gymId,
        },
      });

      return {
        access: 'DENIED',
        reason: 'Membresía no activa',
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
        gymId: gymId,
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