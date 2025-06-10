import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const CurrentGym = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new InternalServerErrorException('No se encontró el usuario en la solicitud. Asegúrate de que AuthGuard esté activo.');
    }
    
    // Determine the gym based on user relationships with priority: working at > owned > member
    let gym = null;
    
    if (user.workingAtGym) {
      gym = user.workingAtGym;
    } else if (user.ownedGyms && user.ownedGyms.length > 0) {
      gym = user.ownedGyms[0];
    } else if (user.memberOfGyms && user.memberOfGyms.length > 0) {
      gym = user.memberOfGyms[0];
    }
    
    if (!gym) {
      // Esto podría lanzar una excepción o ser manejado en el servicio.
      // Por ahora, devolvemos null y dejamos que el servicio lo valide.
      return null;
    }

    return gym;
  },
);
