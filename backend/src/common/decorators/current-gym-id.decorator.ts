import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { AuthRequest } from '../interfaces/auth-request.interface';

export const CurrentGymId = createParamDecorator(
  (required: boolean = true, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;

    if (!user) {
      throw new BadRequestException('User not found in request');
    }

    // Para obtener el gymId, necesitamos hacer una consulta a la BD
    // Por ahora, retornamos null y manejamos esto en el servicio
    // En una implementación más avanzada, podríamos usar un interceptor
    // que enriquezca el request con datos del usuario completo
    
    if (required) {
      // El servicio debe validar que el usuario tenga un gym asociado
      return null;
    }
    
    return null;
  },
);