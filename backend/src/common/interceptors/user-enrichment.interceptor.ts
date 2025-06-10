import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthRequest } from '../interfaces/auth-request.interface';

@Injectable()
export class UserEnrichmentInterceptor implements NestInterceptor {
  private readonly logger = new Logger(UserEnrichmentInterceptor.name);
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
            ownedGyms: true,
            memberOfGyms: true,
            workingAtGym: true,
          },
        });
        
        if (fullUser) {
          // Enriquecer el request con datos completos del usuario
          (request as any).fullUser = fullUser;
          
          // Determinar el gimnasio actual del usuario
          let gymId: string | null = null;
          
          // Si es staff, usar el gimnasio donde trabaja
          if (fullUser.workingAtGym) {
            gymId = fullUser.workingAtGym.id;
          } 
          // Si es dueño, usar el primer gimnasio que posee (si hay alguno)
          else if (fullUser.ownedGyms && fullUser.ownedGyms.length > 0) {
            gymId = fullUser.ownedGyms[0].id;
          }
          // Si es miembro, usar el primer gimnasio al que pertenece (si hay alguno)
          else if (fullUser.memberOfGyms && fullUser.memberOfGyms.length > 0) {
            gymId = fullUser.memberOfGyms[0].id;
          }
          
          (request as any).gymId = gymId;
        }
      } catch (error) {
        // Si hay error, continuamos sin enriquecer
        this.logger.warn(`Failed to enrich user data: ${error.message}`);
      }
    }

    return next.handle();
  }
}