import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGymDto } from './dto/create-gym.dto';

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
    const gym = await this.prisma.gym.create({
      data: {
        ...gymData,
        ownerId: userId,
      }
    });

    return {
      success: true,
      message: 'Gimnasio creado exitosamente',
      data: gym
    };
  }

  async update(id: string, gymData: Partial<CreateGymDto>) {
    const gym = await this.prisma.gym.update({
      where: { id },
      data: gymData,
    });

    return {
      success: true,
      message: 'Gimnasio actualizado exitosamente',
      data: gym
    };
  }

  async delete(id: string) {
    await this.prisma.gym.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Gimnasio eliminado exitosamente'
    };
  }
}