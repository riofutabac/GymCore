import { 
  Injectable, 
  UnauthorizedException, 
  BadRequestException, 
  NotFoundException,
  ConflictException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  private supabaseAdmin: SupabaseClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    // Inicializar el cliente de admin de Supabase
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required Supabase configuration');
    }

    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }

  // Login y register ahora son manejados por Supabase directamente en el frontend

  // El registro ahora es manejado por Supabase y el trigger de base de datos

  // La validación del token ahora es manejada por la estrategia de Supabase

  /**
   * Crea un usuario en la base de datos a partir de los datos de Supabase
   * Este método es llamado por el webhook cuando se crea un usuario en Supabase
   */
  async createUserFromSupabase(userData: any) {
    try {
      this.logger.log(`👤 Creando usuario desde Supabase: ${userData.email}`);

      // Verificar si el usuario ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userData.id }
      });

      if (existingUser) {
        this.logger.log(`✅ Usuario ya existe: ${userData.email}`);
        return existingUser;
      }

      // Extraer datos del usuario de Supabase
      const { id, email, user_metadata } = userData;
      const name = user_metadata?.name || email.split('@')[0];
      const role = (user_metadata?.role || 'CLIENT').toUpperCase();

      // Crear el usuario en nuestra base de datos
      const newUser = await this.prisma.user.create({
        data: {
          id,
          email,
          name,
          role,
          isActive: true,
          emailVerified: !!userData.email_confirmed_at
        }
      });

      this.logger.log(`✅ Usuario creado exitosamente: ${email}`);
      return newUser;
    } catch (error) {
      this.logger.error(`❌ Error creando usuario: ${error.message}`);
      throw new BadRequestException(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Método alternativo para crear manualmente un usuario desde Supabase
   * Útil para sincronizar usuarios existentes en Supabase pero no en nuestra base de datos
   */
  async syncUserFromSupabase(supabaseUserId: string, userData: any) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { id: supabaseUserId }
      });

      if (existingUser) {
        throw new ConflictException(`User with ID ${supabaseUserId} already exists`);
      }

      // Crear el usuario en nuestra base de datos
      const newUser = await this.prisma.user.create({
        data: {
          id: supabaseUserId,
          email: userData.email,
          name: userData.name || userData.email.split('@')[0],
          role: (userData.role || 'CLIENT').toUpperCase(),
          isActive: true,
          emailVerified: !!userData.emailVerified
        }
      });

      this.logger.log(`✅ Usuario sincronizado: ${userData.email}`);
      return newUser;
    } catch (error) {
      this.logger.error(`❌ Error sincronizando usuario: ${error.message}`);
      throw new BadRequestException(`Failed to sync user: ${error.message}`);
    }
  }

  async getProfile(userId: string): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatarUrl: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          // Incluir relaciones según el rol
          ownedGyms: {
            select: {
              id: true,
              name: true,
              isActive: true,
            }
          },
          managedGym: {
            select: {
              id: true,
              name: true,
              isActive: true,
            }
          },
          workingAtGym: {
            select: {
              id: true,
              name: true,
              isActive: true,
            }
          },
          memberOfGyms: {
            select: {
              id: true,
              name: true,
              isActive: true,
            }
          },
          memberships: {
            select: {
              id: true,
              type: true,
              status: true,
              startDate: true,
              expiresAt: true,
            }
          }
        }
      });

      if (!user) {
        this.logger.warn(`User with id ${userId} not found in database`);
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error(`Error getting profile for user ${userId}:`, error);
      throw error;
    }
  }

  async getUsersByRole(role: string): Promise<any[]> {
    try {
      this.logger.log(`🔍 Obteniendo usuarios con rol: ${role}`);

      // Validar que el rol proporcionado sea válido y convertirlo al enum UserRole
      const upperRole = role.toUpperCase();

      // Verificar si el rol es válido utilizando Object.values
      const validRoles = Object.values(UserRole);
      if (!validRoles.includes(upperRole as UserRole)) {
        this.logger.error(`Invalid role provided: ${role}`);
        throw new BadRequestException(`Invalid role: ${role}`);
      }

      // Asignar el rol validado
      const userRole = upperRole as UserRole;
      const users = await this.prisma.user.findMany({
        where: { 
          role: userRole,
          isActive: true
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          emailVerified: true,
          createdAt: true,
        }
      });

      return users;
    } catch (error) {
      this.logger.error(`❌ Error obteniendo usuarios por rol: ${error.message}`);
      throw new BadRequestException(`Failed to get users with role ${role}`);
    }
  }

  async syncUserFromSupabaseV1(userId: string, email: string, name?: string, role?: string): Promise<any> {
    try {
      const user = await this.prisma.user.upsert({
        where: { id: userId },
        update: {
          email,
          name: name || email.split('@')[0],
          role: (role || 'CLIENT') as any,
          updatedAt: new Date(),
        },
        create: {
          id: userId,
          email,
          name: name || email.split('@')[0],
          role: (role || 'CLIENT') as any,
          isActive: true,
          emailVerified: true,
        },
        include: {
          ownedGyms: true,
          managedGym: true,
          memberOfGyms: true,
          memberships: true,
        },
      });

      this.logger.debug(`User synced successfully: ${user.email}`);
      return user;
    } catch (error) {
      this.logger.error(`Error syncing user ${userId}:`, error);
      throw error;
    }
  }

  async getAllUsers(): Promise<any[]> {
    try {
      // Verificar la conexión a la base de datos
      try {
        await this.prisma.$queryRaw`SELECT 1`;
      } catch (dbError) {
        this.logger.error('❌ Error de conexión a BD');
        throw new Error('Database connection failed');
      }

      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          workingAtGymId: true,
          createdAt: true,
          updatedAt: true,
          workingAtGym: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      this.logger.log(`✅ ${users.length} usuarios obtenidos`);
      
      return users;
    } catch (error) {
      this.logger.error(`❌ Error obteniendo usuarios: ${error.message}`);
      throw new BadRequestException(`Failed to retrieve users: ${error.message}`);
    }
  }

  async createStaffUser(userData: any, ownerId: string) {
    try {
      this.logger.log(`👥 Creando usuario staff: ${userData.email}`);

      // Crear el usuario en nuestra base de datos
      const newUser = await this.prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          role: userData.role.toUpperCase(),
          isActive: true,
          emailVerified: false,
          workingAtGymId: userData.gymId || null,
        }
      });

      this.logger.log(`✅ Usuario staff creado: ${userData.email}`);
      return newUser;
    } catch (error) {
      this.logger.error(`❌ Error creando staff: ${error.message}`);
      throw new BadRequestException(`Failed to create staff user: ${error.message}`);
    }
  }

  async updateUser(userId: string, updateData: any) {
    try {
      this.logger.log(`Updating user ${userId} with data: ${JSON.stringify(updateData)}`);
      
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          name: updateData.name,
          role: updateData.role?.toUpperCase(),
          workingAtGymId: updateData.gymId || null,
          isActive: updateData.isActive,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          workingAtGymId: true,
          createdAt: true,
          updatedAt: true,
          workingAtGym: {
            select: {
              id: true,
              name: true,
            }
          }
        },
      });

      this.logger.log(`✅ Usuario actualizado: ${userId}`);
      return user;
    } catch (error) {
      this.logger.error(`❌ Error actualizando usuario: ${error.message}`);
      throw new BadRequestException(`Failed to update user: ${error.message}`);
    }
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    try {
      this.logger.log(`Setting user ${userId} active status to: ${isActive}`);
      
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { 
          isActive,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          workingAtGymId: true,
          createdAt: true,
          updatedAt: true,
          workingAtGym: {
            select: {
              id: true,
              name: true,
            }
          }
        },
      });

      this.logger.log(`✅ Estado actualizado: ${userId} -> ${isActive}`);
      return user;
    } catch (error) {
      this.logger.error(`❌ Error actualizando estado: ${error.message}`);
      throw new BadRequestException(`Failed to update user status: ${error.message}`);
    }
  }

  async resetUserPassword(userId: string) {
    try {
      this.logger.log(`🔐 Reseteando contraseña: ${userId}`);
      
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Llamar a la API de Supabase para enviar el correo de restablecimiento
      const { data, error } = await this.supabaseAdmin.auth.resetPasswordForEmail(user.email);

      if (error) {
        this.logger.error(`❌ Error de Supabase reseteando contraseña: ${error.message}`);
        throw new BadRequestException(`Failed to initiate password reset: ${error.message}`);
      }

      this.logger.log(`✅ Email de reset enviado: ${user.email}`);
      
      return { message: 'Password reset email sent successfully' };
    } catch (error) {
      this.logger.error(`❌ Error reseteando contraseña: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to reset password: ${error.message}`);
    }
  }
}