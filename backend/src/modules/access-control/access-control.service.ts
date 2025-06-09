import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ValidateQRDto } from './dto/validate-qr.dto';
import { AccessType, AccessStatus } from '@prisma/client';

@Injectable()
export class AccessControlService {
  constructor(private prisma: PrismaService) {}

  async getMyQR(userId: string) {
    try {
      console.log('🔍 [ACCESS CONTROL] Getting QR for user:', userId);
      
      // Verificar que el usuario existe y tiene membresía activa
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          membership: true,
        },
      });

      console.log('👤 [ACCESS CONTROL] User found:', user ? 'YES' : 'NO');
      console.log('💳 [ACCESS CONTROL] User membership:', user?.membership);

      if (!user) {
        console.log('❌ [ACCESS CONTROL] User not found');
        throw new NotFoundException('Usuario no encontrado');
      }

      // Debug detallado de la membresía
      if (!user.membership) {
        console.log('❌ [ACCESS CONTROL] No membership found for user');
        
        // Intentar crear una membresía por defecto para el usuario
        console.log('🔧 [ACCESS CONTROL] Creating default membership for user');
        const newMembership = await this.prisma.membership.create({
          data: {
            userId: user.id,
            type: 'MONTHLY',
            status: 'ACTIVE',
            startDate: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
            monthlyPrice: 50.00,
            totalPaid: 0,
            autoRenewal: false,
          },
        });
        
        console.log('✅ [ACCESS CONTROL] Default membership created:', newMembership);
        
        // Actualizar el objeto user con la nueva membresía
        user.membership = newMembership;
      }

      console.log('📊 [ACCESS CONTROL] Membership status:', user.membership.status);
      console.log('📅 [ACCESS CONTROL] Membership expires at:', user.membership.expiresAt);

      if (user.membership.status !== 'ACTIVE') {
        console.log('❌ [ACCESS CONTROL] Membership not active, status:', user.membership.status);
        throw new BadRequestException('Membresía no activa');
      }

      // Verificar si la membresía no ha expirado
      if (user.membership.expiresAt && new Date() > user.membership.expiresAt) {
        console.log('❌ [ACCESS CONTROL] Membership expired');
        throw new BadRequestException('Membresía expirada');
      }

      // Generar QR dinámico con timestamp
      const qrData = `${userId}-${Date.now()}`;
      
      // Simular imagen QR (en producción usar una librería real como qrcode)
      const qrCodeUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;

      console.log('✅ [ACCESS CONTROL] QR generated successfully');

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
      console.error('💥 [ACCESS CONTROL] Error in getMyQR:', error);
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