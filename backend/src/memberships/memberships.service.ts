import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembershipsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'Basic Membership',
          price: 29.99,
          duration: '1 month',
          features: ['Gym access', 'Locker room']
        },
        {
          id: '2',
          name: 'Premium Membership',
          price: 49.99,
          duration: '1 month',
          features: ['Gym access', 'Locker room', 'Personal training', 'Classes']
        }
      ]
    };
  }

  async findOne(id: string) {
    return {
      success: true,
      data: {
        id,
        name: 'Basic Membership',
        price: 29.99,
        duration: '1 month',
        features: ['Gym access', 'Locker room']
      }
    };
  }

  async create(membershipData: any) {
    return {
      success: true,
      message: 'Membership created successfully',
      data: {
        id: '3',
        ...membershipData
      }
    };
  }
}
