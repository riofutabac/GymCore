import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserContextService } from '../../common/services/user-context.service';
import { ValidateQRDto } from './dto/validate-qr.dto';
import { AccessType, AccessStatus } from '@prisma/client';

@Injectable()
export class AccessControlService {
  private readonly logger = new Logger(AccessControlService.name);

  constructor(
    private prisma: PrismaService,
    private userContextService: UserContextService,
  ) {}

  async getMyQR(userId: string) {
    try {
      this.logger.log(`Getting QR for user: ${userId}`);
      
      // Verificar que el usuario existe y tiene membresía activa
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          membership: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.membership) {
        this.logger.log(`No membership found for user ${userId}, creating default one`);
        
        // Crear membresía por defecto
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
        
        user.membership = newMembership;
      }

      if (user.membership.status !== 'ACTIVE') {
        throw new BadRequestException('Membership is not active');
      }

      // Verificar si la membresía no ha expirado
      if (user.membership.expiresAt && new Date() > user.membership.expiresAt) {
        throw new BadRequestException('Membership has expired');
      }

      // Generar QR dinámico con timestamp
      const qrData = `${userId}-${Date.now()}`;
      
      // Simular imagen QR (en producción usar una librería real como qrcode)
      const qrCodeUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;

      this.logger.log(`QR generated successfully for user: ${userId}`);

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
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error generating QR for user ${userId}: ${error.message}`, error.stack);
      throw new UnprocessableEntityException('Failed to generate QR code');
    }
  }

  async validateQR(validateQRDto: ValidateQRDto, validatorId: string) {
    try {
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

      // Obtener gymId del validador para el log de acceso
      const validatorGymId = await this.userContextService.getUserGymId(validatorId);

      if (!user.membership || user.membership.status !== 'ACTIVE') {
        await this.prisma.accessLog.create({
          data: {
            type: AccessType.QR_CODE,
            status: AccessStatus.DENIED,
            method: 'QR_SCAN',
            userId: userId,
            gymId: validatorGymId,
          },
        });

        return {
          access: 'DENIED',
          reason: 'Membership is not active',
          user: {
            name: user.name,
            email: user.email,
          },
        };
      }

      // Verificar expiración de membresía
      if (user.membership.expiresAt && new Date() > user.membership.expiresAt) {
        await this.prisma.accessLog.create({
          data: {
            type: AccessType.QR_CODE,
            status: AccessStatus.DENIED,
            method: 'QR_SCAN',
            userId: userId,
            gymId: validatorGymId,
          },
        });

        return {
          access: 'DENIED',
          reason: 'Membership has expired',
          user: {
            name: user.name,
            email: user.email,
          },
        };
      }

      // Acceso concedido
      await this.prisma.accessLog.create({
        data: {
          type: AccessType.QR_CODE,
          status: AccessStatus.GRANTED,
          method: 'QR_SCAN',
          userId: userId,
          gymId: validatorGymId,
        },
      });

      this.logger.log(`Access granted for user: ${userId}`);

      return {
        access: 'GRANTED',
        user: {
          name: user.name,
          email: user.email,
          membershipStatus: user.membership.status,
          expiresAt: user.membership.expiresAt,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error validating QR: ${error.message}`, error.stack);
      throw new UnprocessableEntityException('Failed to validate QR code');
    }
  }
}