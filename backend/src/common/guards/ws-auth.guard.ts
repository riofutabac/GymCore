import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Socket } from 'socket.io';
import { Logger } from 'nestjs-pino';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractTokenFromHandshake(client);

      if (!token) {
        this.logger.warn('No token provided in WebSocket connection');
        throw new WsException('Unauthorized: No token provided');
      }

      // Verificar el token JWT
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('SUPABASE_JWT_SECRET'),
      });

      if (!payload || !payload.sub) {
        this.logger.warn('Invalid token payload in WebSocket connection');
        throw new WsException('Unauthorized: Invalid token');
      }

      // Buscar el usuario en la base de datos
      const user = await this.prisma.user.findUnique({
        where: { 
          id: payload.sub,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      if (!user) {
        this.logger.warn(`User ${payload.sub} not found or inactive for WebSocket connection`);
        throw new WsException('Unauthorized: User not found or inactive');
      }

      // Adjuntar el usuario al cliente para uso posterior
      client.data.user = user;
      this.logger.debug(`WebSocket authentication successful for user: ${user.email}`);

      return true;
    } catch (error) {
      this.logger.error(`WebSocket authentication failed: ${error.message}`);
      
      if (error instanceof WsException) {
        throw error;
      }
      
      throw new WsException('Unauthorized: Authentication failed');
    }
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    // Intentar extraer el token de diferentes lugares
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // También revisar en los query parameters
    const tokenFromQuery = client.handshake.query.token;
    if (typeof tokenFromQuery === 'string') {
      return tokenFromQuery;
    }

    // Revisar en auth como query parameter
    const authFromQuery = client.handshake.query.auth;
    if (typeof authFromQuery === 'string') {
      return authFromQuery;
    }

    return null;
  }
}
