import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {

  private supabase;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
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
    
    // Initialize Supabase client after super()
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  async validate(payload: any): Promise<any> {
    try {
      const userId = payload.sub;

      if (!userId) {
        this.logger.error('Token sin ID de usuario válido');
        throw new UnauthorizedException('Invalid token: no user ID');
      }

      // Buscar o crear el usuario en nuestra base de datos
      let user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        this.logger.log(`👤 Sincronizando usuario desde Supabase: ${payload.email}`);

        // Obtener información del usuario desde Supabase
        const { data: supabaseUser, error } = await this.supabase.auth.admin.getUserById(userId);

        if (error || !supabaseUser) {
          this.logger.error(`❌ Usuario no encontrado en Supabase: ${error?.message}`);
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

          this.logger.log(`✅ Usuario creado: ${user.email}`);
        } catch (createError) {
          this.logger.error(`❌ Error creando usuario: ${createError.message}`);
          throw new UnauthorizedException('Failed to create user in database');
        }
      }

      // Verificar que el usuario esté activo
      if (!user.isActive) {
        this.logger.warn(`⚠️  Usuario inactivo: ${user.email}`);
        throw new UnauthorizedException('User account is inactive');
      }

      return user;
    } catch (error) {
      this.logger.error(`❌ Error de autenticación: ${error.message}`);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token validation failed');
    }
  }
}