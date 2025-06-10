import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserContextService {
  private readonly logger = new Logger(UserContextService.name);
  constructor(private prisma: PrismaService) {}

  async getUserGymId(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedGyms: true,
        memberOfGyms: true,
        workingAtGym: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Prioridad: Staff > Member > Owner
    let gymId: string | null = null;
    
    // Si es staff, usar el gimnasio donde trabaja
    if (user.workingAtGym) {
      gymId = user.workingAtGym.id;
    } 
    // Si es miembro, usar el primer gimnasio al que pertenece (si hay alguno)
    else if (user.memberOfGyms && user.memberOfGyms.length > 0) {
      gymId = user.memberOfGyms[0].id;
    }
    // Si es dueño, usar el primer gimnasio que posee (si hay alguno)
    else if (user.ownedGyms && user.ownedGyms.length > 0) {
      gymId = user.ownedGyms[0].id;
    }

    if (!gymId) {
      this.logger.warn(`User ${userId} is not associated with any gym`);
      throw new BadRequestException('User is not associated with any gym');
    }

    return gymId;
  }

  async getUserWithGym(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedGyms: true,
        memberOfGyms: true,
        workingAtGym: true,
        memberships: true,
      },
    });
  }
}