import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthRequest } from '../interfaces/auth-request.interface';

@Injectable()
export class UserEnrichmentInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    
    if (request.user?.sub) {
      try {
        const fullUser = await this.prisma.user.findUnique({
          where: { id: request.user.sub },
          include: {
            ownedGym: true,
            memberOfGym: true,
            staffOfGym: true,
          },
        });
        
        if (fullUser) {
          // Enriquecer el request con datos completos del usuario
          (request as any).fullUser = fullUser;
          (request as any).gymId = fullUser.staffOfGymId || 
                                   fullUser.memberOfGymId || 
                                   fullUser.ownedGym?.id;
        }
      } catch (error) {
        // Si hay error, continuamos sin enriquecer
        console.warn('Failed to enrich user data:', error.message);
      }
    }

    return next.handle();
  }
}