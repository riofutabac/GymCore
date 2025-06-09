import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGymDto } from './dto/create-gym.dto';

// Función para generar código único de gimnasio
const generateJoinCode = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

@Injectable()
export class GymsService {
  constructor(private prisma: PrismaService) {}

  async joinByCode(code: string) {
    try {
      const gym = await this.prisma.gym.findUnique({
        where: { joinCode: code.toUpperCase() },
        include: {
          _count: {
            select: {
              members: true,
              staff: true,
            }
          }
        }
      });

      if (!gym) {
        throw new NotFoundException('Código de gimnasio inválido');
      }

      return {
        success: true,
        message: 'Te has unido al gimnasio exitosamente',
        gym: {
          id: gym.id,
          name: gym.name,
          code: gym.joinCode
        }
      };
    } catch (error) {
      console.error('Error joining gym by code:', error);
      throw error;
    }
  }

  async getAll() {
    try {
      const gyms = await this.prisma.gym.findMany({
        include: {
          _count: {
            select: {
              members: true,
              staff: true,
            }
          }
        }
      });

      return {
        success: true,
        data: gyms
      };
    } catch (error) {
      console.error('Error getting all gyms:', error);
      throw error;
    }
  }

  async getMyGym(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          memberOfGym: true,
          staffOfGym: true,
          ownedGym: true,
        }
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const gym = user.ownedGym || user.staffOfGym || user.memberOfGym;

      if (!gym) {
        throw new NotFoundException('No estás asociado a ningún gimnasio');
      }

      return {
        success: true,
        data: gym
      };
    } catch (error) {
      console.error('Error getting my gym:', error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const gym = await this.prisma.gym.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              members: true,
              staff: true,
            }
          }
        }
      });

      if (!gym) {
        throw new NotFoundException('Gimnasio no encontrado');
      }

      return {
        success: true,
        data: gym
      };
    } catch (error) {
      console.error('Error getting gym by id:', error);
      throw error;
    }
  }

  async create(gymData: CreateGymDto, userId: string) {
    try {
      // Generar joinCode único
      let joinCode = generateJoinCode();
      
      // Verificar que el código sea único
      let existingGym = await this.prisma.gym.findUnique({
        where: { joinCode }
      });
      
      while (existingGym) {
        joinCode = generateJoinCode();
        existingGym = await this.prisma.gym.findUnique({
          where: { joinCode }
        });
      }

      const gym = await this.prisma.gym.create({
        data: {
          ...gymData,
          joinCode,
          ownerId: userId,
        }
      });

      return {
        success: true,
        message: 'Gimnasio creado exitosamente',
        data: gym
      };
    } catch (error) {
      console.error('Error creating gym:', error);
      throw new Error('Error al crear el gimnasio');
    }
  }

  async update(id: string, gymData: Partial<CreateGymDto>) {
    try {
      const gym = await this.prisma.gym.update({
        where: { id },
        data: gymData,
      });

      return {
        success: true,
        message: 'Gimnasio actualizado exitosamente',
        data: gym
      };
    } catch (error) {
      console.error('Error updating gym:', error);
      throw new Error('Error al actualizar el gimnasio');
    }
  }

  async delete(id: string) {
    try {
      // Eliminar registros relacionados primero
      await this.prisma.$transaction(async (tx) => {
        // Eliminar logs de acceso
        await tx.accessLog.deleteMany({
          where: { gymId: id }
        });

        // Eliminar items de venta
        const sales = await tx.sale.findMany({
          where: { gymId: id },
          select: { id: true }
        });
        
        for (const sale of sales) {
          await tx.saleItem.deleteMany({
            where: { saleId: sale.id }
          });
        }

        // Eliminar ventas
        await tx.sale.deleteMany({
          where: { gymId: id }
        });

        // Eliminar productos
        await tx.product.deleteMany({
          where: { gymId: id }
        });

        // Actualizar usuarios (quitar relación con el gimnasio)
        await tx.user.updateMany({
          where: { memberOfGymId: id },
          data: { memberOfGymId: null }
        });

        await tx.user.updateMany({
          where: { staffOfGymId: id },
          data: { staffOfGymId: null }
        });

        // Finalmente eliminar el gimnasio
        await tx.gym.delete({
          where: { id }
        });
      });

      return {
        success: true,
        message: 'Gimnasio eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error deleting gym:', error);
      throw new Error('Error al eliminar el gimnasio');
    }
  }
}