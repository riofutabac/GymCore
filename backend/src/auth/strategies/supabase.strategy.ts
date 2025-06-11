import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  private readonly logger = new Logger(SupabaseStrategy.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    const secret = configService.get<string>('SUPABASE_JWT_SECRET');
    if (!secret) {
      throw new Error('SUPABASE_JWT_SECRET must be defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret
    });
  }

  async validate(payload: any) {
    try {
      if (!payload) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
          isActive: true,
        },
      });

      if (!user) {
        this.logger.warn(`User with id ${payload.sub} not found in database`);
        throw new UnauthorizedException('User not found');
      }

      if (!user.isActive) {
        this.logger.warn(`User ${user.email} account is inactive`);
        throw new UnauthorizedException('Account is inactive');
      }

      // Devolver el usuario para que esté disponible en el request
      return user;
    } catch (error) {
      this.logger.error(`Token validation error: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }
}