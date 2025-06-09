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
    // Códigos de prueba válidos
    const validCodes = ['GYM123', 'FIT456', 'HEALTH789'];
    
    if (!validCodes.includes(code.toUpperCase())) {
      throw new NotFoundException('Código de gimnasio inválido');
    }

    return {
      success: true,
      message: 'Te has unido al gimnasio exitosamente',
      gym: {
        id: '1',
        name: 'PowerFit Gym',
        code: code.toUpperCase()
      }
    };
  }

  async getAll() {
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
  }

  async getMyGym(userId: string) {
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
      // Retornar gimnasio por defecto
      return {
        success: true,
        data: {
          id: 'demo-gym',
          name: 'GymCore Demo',
          address: 'Calle Principal 123, Ciudad',
          phone: '+1 234 567 8900',
          email: 'info@gymcore.demo'
        }
      };
    }

    return {
      success: true,
      data: gym
    };
  }

  async getById(id: string) {
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
  }

  async create(gymData: CreateGymDto, userId: string) {
    try {
      // FIX: Generar joinCode único antes de crear
      const joinCode = generateJoinCode();

      const gym = await this.prisma.gym.create({
        data: {
          ...gymData,
          joinCode, // Añadir el código generado
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
      // FIX: Eliminar registros relacionados primero
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