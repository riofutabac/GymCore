import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const CurrentGym = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new InternalServerErrorException('No se encontró el usuario en la solicitud. Asegúrate de que AuthGuard esté activo.');
    }
    
    const gym = user.ownedGym || user.staffOfGym || user.memberOfGym;
    
    if (!gym) {
      // Esto podría lanzar una excepción o ser manejado en el servicio.
      // Por ahora, devolvemos null y dejamos que el servicio lo valide.
      return null;
    }

    return gym;
  },
);
