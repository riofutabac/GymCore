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

      this.logger.log(`🔑 Token extraído: ${token ? 'Presente' : 'Ausente'}`);

      if (!token) {
        this.logger.warn('⚠️ No token provided in WebSocket connection');
        throw new WsException('Unauthorized: No token provided');
      }

      // Verificar el token JWT de Supabase
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('SUPABASE_JWT_SECRET'),
      });

      this.logger.log(`🔍 Payload verificado: ${JSON.stringify({ sub: payload.sub, email: payload.email })}`);

      if (!payload || !payload.sub) {
        this.logger.warn('⚠️ Invalid token payload in WebSocket connection');
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

      this.logger.log(`👤 Usuario encontrado: ${user ? user.email : 'No encontrado'}`);

      if (!user) {
        this.logger.warn(`⚠️ User ${payload.sub} not found or inactive for WebSocket connection`);
        throw new WsException('Unauthorized: User not found or inactive');
      }

      // Adjuntar el usuario al cliente para uso posterior
      client.data.user = user;
      this.logger.log(`✅ WebSocket authentication successful for user: ${user.email}`);

      return true;
    } catch (error) {
      this.logger.error(`❌ WebSocket authentication failed: ${error.message}`);
      
      if (error instanceof WsException) {
        throw error;
      }
      
      // Si es error de JWT, dar más detalles
      if (error.name === 'JsonWebTokenError') {
        this.logger.error(`🔐 JWT Error: ${error.message}`);
        throw new WsException('Unauthorized: Invalid JWT token');
      }
      
      if (error.name === 'TokenExpiredError') {
        this.logger.error(`⏰ JWT Expired: ${error.message}`);
        throw new WsException('Unauthorized: Token expired');
      }
      
      throw new WsException('Unauthorized: Authentication failed');
    }
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    // 1. Intentar extraer de auth en handshake (método preferido)
    const authToken = client.handshake.auth?.token;
    if (authToken && typeof authToken === 'string') {
      this.logger.log('🔑 Token encontrado en handshake.auth.token');
      return authToken;
    }

    // 2. Intentar extraer del header Authorization
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      this.logger.log('🔑 Token encontrado en Authorization header');
      return authHeader.substring(7);
    }

    // 3. Intentar extraer de query parameters
    const tokenFromQuery = client.handshake.query.token;
    if (tokenFromQuery && typeof tokenFromQuery === 'string') {
      this.logger.log('🔑 Token encontrado en query.token');
      return tokenFromQuery;
    }

    // 4. Intentar extraer de auth como query parameter
    const authFromQuery = client.handshake.query.auth;
    if (authFromQuery && typeof authFromQuery === 'string') {
      this.logger.log('🔑 Token encontrado en query.auth');
      return authFromQuery;
    }

    this.logger.warn('❌ No se encontró token en ninguna ubicación');
    this.logger.warn(`🔍 Handshake auth: ${JSON.stringify(client.handshake.auth)}`);
    this.logger.warn(`🔍 Handshake query: ${JSON.stringify(client.handshake.query)}`);
    this.logger.warn(`🔍 Handshake headers: ${JSON.stringify(client.handshake.headers.authorization)}`);

    return null;
  }
}
