import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  private readonly logger = new Logger(SupabaseStrategy.name);
  private supabase;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    const jwtSecret = configService.get<string>('SUPABASE_JWT_SECRET');

    if (!supabaseUrl || !supabaseServiceKey || !jwtSecret) {
      throw new Error('Missing required Supabase configuration');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
    
    // Initialize logger and Supabase client after super()
    this.logger.debug(`Supabase URL: configured`);
    this.logger.debug(`Supabase Service Key: configured`);
    this.logger.debug(`JWT Secret: configured`);

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  async validate(payload: any): Promise<any> {
    try {
      this.logger.debug(`Validating token for user: ${payload.sub}`);
      this.logger.debug(`Token payload: ${JSON.stringify(payload, null, 2)}`);

      // El payload contiene la información del usuario de Supabase
      const userId = payload.sub;

      if (!userId) {
        this.logger.error('No user ID found in token payload');
        throw new UnauthorizedException('Invalid token: no user ID');
      }

      // Buscar o crear el usuario en nuestra base de datos
      let user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        this.logger.log(`User ${userId} not found in database, attempting to sync from Supabase`);

        // Obtener información del usuario desde Supabase
        const { data: supabaseUser, error } = await this.supabase.auth.admin.getUserById(userId);

        if (error || !supabaseUser) {
          this.logger.error(`Failed to fetch user from Supabase: ${error?.message}`);
          throw new UnauthorizedException('User not found in Supabase');
        }

        // Crear el usuario en nuestra base de datos
        const userData = supabaseUser.user;
        try {
          user = await this.prisma.user.create({
            data: {
              id: userData.id,
              email: userData.email,
              name: userData.user_metadata?.name || userData.email.split('@')[0],
              role: (userData.user_metadata?.role || 'CLIENT').toUpperCase(),
              isActive: true,
              emailVerified: !!userData.email_confirmed_at,
            }
          });

          this.logger.log(`User ${user.email} created successfully in database`);
        } catch (createError) {
          this.logger.error(`Failed to create user in database: ${createError.message}`);
          throw new UnauthorizedException('Failed to create user in database');
        }
      } else {
        this.logger.debug(`User ${user.email} found in database`);
      }

      // Verificar que el usuario esté activo
      if (!user.isActive) {
        this.logger.warn(`Inactive user ${user.email} attempted to authenticate`);
        throw new UnauthorizedException('User account is inactive');
      }

      return user;
    } catch (error) {
      this.logger.error(`Validation error: ${error.message}`, error.stack);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token validation failed');
    }
  }
}