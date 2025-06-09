import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { JoinGymDto } from './dto/join-gym.dto';

@Injectable()
export class GymsService {
  constructor(private prisma: PrismaService) {}

  async create(createGymDto: CreateGymDto, ownerId: string) {
    return this.prisma.gym.create({
      data: {
        ...createGymDto,
        ownerId,
        joinCode: this.generateJoinCode(),
      },
    });
  }

  async findAll() {
    return this.prisma.gym.findMany({
      include: {
        owner: true,
        _count: {
          select: {
            members: true,
            staff: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const gym = await this.prisma.gym.findUnique({
      where: { id },
      include: {
        owner: true,
        members: true,
        staff: true,
      },
    });
    if (!gym) {
      throw new NotFoundException(`Gym with ID ${id} not found`);
    }
    return gym;
  }

  async joinGymByCode(userId: string, joinGymDto: JoinGymDto) {
    const gym = await this.prisma.gym.findUnique({
      where: { joinCode: joinGymDto.joinCode },
    });

    if (!gym) {
      throw new NotFoundException('Invalid join code');
    }

    // Update user to be member of the gym
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        memberOfGymId: gym.id,
      },
    });

    return gym;
  }

  async findMyGym(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberOfGym: true,
        ownedGym: true,
        staffOfGym: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const gym = user.ownedGym || user.memberOfGym || user.staffOfGym;

    if (!gym) {
      throw new NotFoundException('User is not associated with a gym');
    }

    return gym;
  }

  private generateJoinCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}