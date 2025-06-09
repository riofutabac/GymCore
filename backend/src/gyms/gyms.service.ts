import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { JoinGymDto } from './dto/join-gym.dto';
import { generateUniqueCode } from '../utils/generate-unique-code'; // Assuming you have a utility function for generating codes

@Injectable()
export class GymsService {
  constructor(private prisma: PrismaService) {}

  async create(createGymDto: CreateGymDto) {
    const joinCode = await generateUniqueCode(this.prisma.gym, 'joinCode');
    return this.prisma.gym.create({
      data: {
        ...createGymDto,
        joinCode,
      },
    });
  }

  async findAll() {
    return this.prisma.gym.findMany();
  }

  async findOne(id: number) {
    const gym = await this.prisma.gym.findUnique({ where: { id } });
    if (!gym) {
      throw new NotFoundException(`Gym with ID ${id} not found`);
    }
    return gym;
  }

  async update(id: number, updateGymDto: any) { // Consider creating an UpdateGymDto
    const gym = await this.prisma.gym.findUnique({ where: { id } });
    if (!gym) {
      throw new NotFoundException(`Gym with ID ${id} not found`);
    }
    return this.prisma.gym.update({
      where: { id },
      data: updateGymDto,
    });
  }

  async remove(id: number) {
    const gym = await this.prisma.gym.findUnique({ where: { id } });
    if (!gym) {
      throw new NotFoundException(`Gym with ID ${id} not found`);
    }
    return this.prisma.gym.delete({ where: { id } });
  }

  async joinGymByCode(userId: number, joinGymDto: JoinGymDto) {
    const gym = await this.prisma.gym.findUnique({
      where: { joinCode: joinGymDto.joinCode },
    });

    if (!gym) {
      throw new NotFoundException('Invalid join code');
    }

    // Link the user to the gym
    // This assumes you have a many-to-many relationship between User and Gym
    // or a field in the User model to store the gymId
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        gymId: gym.id,
      },
    });

    return gym;
  }

  async findMyGym(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { gym: true }, // Include the gym relation
    });

    if (!user || !user.gym) {
      throw new NotFoundException('User is not associated with a gym');
    }

    return user.gym;
  }
}