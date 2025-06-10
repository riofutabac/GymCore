import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async joinGym(userId: string, gymId: string) {
    try {
      // Verificar si el gimnasio existe
      const gym = await this.prisma.gym.findUnique({
        where: { id: gymId },
      });

      if (!gym) {
        throw new NotFoundException(`Gimnasio con ID ${gymId} no encontrado`);
      }

      if (!gym.isActive) {
        throw new BadRequestException(`El gimnasio ${gym.name} no está activo`);
      }

      // Verificar si el usuario existe
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { memberOfGyms: true }
      });

      if (!user) {
        throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
      }

      // Verificar si el usuario ya está asociado a este gimnasio
      const alreadyMember = user.memberOfGyms.some(g => g.id === gymId);
      if (alreadyMember) {
        throw new ConflictException(`El usuario ya es miembro de este gimnasio`);
      }

      // Asociar el usuario al gimnasio usando la relación many-to-many
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          memberOfGyms: {
            connect: { id: gymId }
          }
        },
        include: {
          memberOfGyms: true
        }
      });

      this.logger.log(`Usuario ${userId} se unió al gimnasio ${gymId} exitosamente`);

      return {
        success: true,
        data: updatedUser,
        message: `Te has unido exitosamente a ${gym.name}`,
      };
    } catch (error) {
      this.logger.error(`Error al unir usuario ${userId} al gimnasio ${gymId}:`, error);
      throw error;
    }
  }
}
