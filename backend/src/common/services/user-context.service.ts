import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserContextService {
  constructor(private prisma: PrismaService) {}

  async getUserGymId(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedGym: true,
        memberOfGym: true,
        staffOfGym: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Prioridad: Staff > Member > Owner
    const gymId = user.staffOfGymId || 
                  user.memberOfGymId || 
                  user.ownedGym?.id;

    if (!gymId) {
      throw new BadRequestException('User is not associated with any gym');
    }

    return gymId;
  }

  async getUserWithGym(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedGym: true,
        memberOfGym: true,
        staffOfGym: true,
        membership: true,
      },
    });
  }
}