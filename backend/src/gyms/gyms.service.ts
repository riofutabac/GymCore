import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GymsService {
  constructor(private prisma: PrismaService) {}

  async joinByCode(code: string) {
    // Mock gym codes para desarrollo
    const validCodes = ['GYM123', 'FIT456', 'HEALTH789'];
    
    if (!validCodes.includes(code.toUpperCase())) {
      throw new NotFoundException('Invalid gym code');
    }

    return {
      success: true,
      message: 'Successfully joined gym',
      gym: {
        id: '1',
        name: 'PowerFit Gym',
        code: code.toUpperCase()
      }
    };
  }

  async getAll() {
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'PowerFit Gym',
          address: 'Calle Principal 123',
          phone: '+1 234 567 8900'
        }
      ]
    };
  }

  async getMyGym(userId: string) {
    return {
      success: true,
      data: {
        id: '1',
        name: 'GymCore Demo',
        address: 'Calle Principal 123, Ciudad',
        phone: '+1 234 567 8900',
        email: 'info@gymcore.demo'
      }
    };
  }

  async getById(id: string) {
    return {
      success: true,
      data: {
        id,
        name: 'PowerFit Gym',
        address: 'Calle Principal 123',
        phone: '+1 234 567 8900'
      }
    };
  }

  async create(gymData: any, userId: string) {
    return {
      success: true,
      message: 'Gym created successfully',
      data: {
        id: '2',
        ...gymData,
        ownerId: userId
      }
    };
  }
}