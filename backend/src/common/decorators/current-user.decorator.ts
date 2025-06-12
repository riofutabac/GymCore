import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    // Determinar si el contexto es HTTP o WebSocket
    if (ctx.getType() === 'http') {
      const request = ctx.switchToHttp().getRequest();
      const user = request.user;
      return data ? user?.[data] : user;
    } else if (ctx.getType() === 'ws') {
      const client: Socket = ctx.switchToWs().getClient();
      const user = client.data?.user;
      return data ? user?.[data] : user;
    }
    return null;
  },
);
