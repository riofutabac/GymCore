import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthRequest } from '../interfaces/auth-request.interface';
import { User, Gym } from '@prisma/client';

@Injectable()
export class UserEnrichmentInterceptor implements NestInterceptor {
  private readonly logger = new Logger(UserEnrichmentInterceptor.name);
  constructor(private prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    
    if (!request.user || (!('sub' in request.user) && !('id' in request.user))) {
      return next.handle();
    }

    try {
      // Optimización: Hacer una sola consulta con select específico
      const fullUser = await this.prisma.user.findUnique({
        where: { id: 'sub' in request.user ? request.user.sub : request.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          workingAtGym: {
            select: {
              id: true,
              name: true,
              isActive: true,
            },
          },
          ownedGyms: {
            select: {
              id: true,
              name: true,
              isActive: true,
            },
            where: {
              isActive: true,
            },
            take: 1,
          },
          memberOfGyms: {
            select: {
              id: true,
              name: true,
              isActive: true,
            },
            where: {
              isActive: true,
            },
            take: 1,
          },
        },
      });
      
      if (!fullUser) {
        throw new BadRequestException('User not found');
      }

      // Cache user data in request
      request.user = {
        ...fullUser,
        phone: null,
        avatarUrl: null,
        permissions: [],
        emailVerified: false,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        workingAtGymId: fullUser.workingAtGym?.id || null
      };

      // Determinar el gimnasio actual del usuario (prioridad: trabajo > propiedad > membresía)
      let currentGym: Partial<Gym> | null = 
        fullUser.workingAtGym ||
        (fullUser.ownedGyms?.[0]) ||
        (fullUser.memberOfGyms?.[0]) ||
        null;

      if (currentGym) {
        request.gymId = currentGym.id;
        request.currentGym = currentGym;
      }

    } catch (error) {
      this.logger.error(`Error enriching user data: ${error.message}`, error.stack);
      throw error;
    }

    return next.handle();
  }
}