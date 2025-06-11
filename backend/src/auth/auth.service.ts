import { 
  Injectable, 
  UnauthorizedException, 
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
  ) {}

  // Login y register ahora son manejados por Supabase directamente en el frontend

  // El registro ahora es manejado por Supabase y el trigger de base de datos

  // La validación del token ahora es manejada por la estrategia de Supabase

  /**
   * Crea un usuario en la base de datos a partir de los datos de Supabase
   * Este método es llamado por el webhook cuando se crea un usuario en Supabase
   */
  async createUserFromSupabase(userData: any) {
    try {
      this.logger.log(`Creating user from Supabase: ${userData.email}`);

      // Verificar si el usuario ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userData.id }
      });

      if (existingUser) {
        this.logger.log(`User ${userData.email} already exists in database`);
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

      this.logger.log(`User ${email} created successfully with ID: ${id}`);
      return newUser;
    } catch (error) {
      this.logger.error(`Error creating user from Supabase: ${error.message}`, error.stack);
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

      this.logger.log(`User ${userData.email} synced successfully with ID: ${supabaseUserId}`);
      return newUser;
    } catch (error) {
      this.logger.error(`Error syncing user from Supabase: ${error.message}`, error.stack);
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
      this.logger.log(`Getting users with role: ${role}`);

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
      this.logger.error(`Error getting users with role ${role}:`, error.stack);
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
      this.logger.debug('Starting getAllUsers method');
      
      // Verificar la conexión a la base de datos
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        this.logger.debug('Database connection is working');
      } catch (dbError) {
        this.logger.error('Database connection error:', dbError);
        throw new Error('Database connection failed');
      }

      this.logger.debug('Executing findMany query...');
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

      this.logger.debug(`Query successful. Found ${users.length} users`);
      this.logger.debug('Sample user data:', users[0] || 'No users found');
      
      return users;
    } catch (error) {
      this.logger.error(`Error in getAllUsers:`, error);
      this.logger.error('Stack trace:', error.stack);
      throw new BadRequestException(`Failed to retrieve users: ${error.message}`);
    }
  }

  async createStaffUser(userData: any, ownerId: string) {
    try {
      this.logger.log(`Owner ${ownerId} creating staff user: ${userData.email}`);

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

      this.logger.log(`Staff user ${userData.email} created successfully with ID: ${newUser.id}`);
      return newUser;
    } catch (error) {
      this.logger.error(`Error creating staff user: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to create staff user: ${error.message}`);
    }
  }

  async updateUser(userId: string, updateData: any) {
    try {
      this.logger.log(`Updating user ${userId} with data:`, updateData);
      
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

      this.logger.log(`User ${userId} updated successfully`);
      return user;
    } catch (error) {
      this.logger.error(`Error updating user ${userId}:`, error);
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

      this.logger.log(`User ${userId} status updated successfully to ${isActive}`);
      return user;
    } catch (error) {
      this.logger.error(`Error updating user status ${userId}:`, error);
      throw new BadRequestException(`Failed to update user status: ${error.message}`);
    }
  }

  async resetUserPassword(userId: string) {
    try {
      this.logger.log(`Resetting password for user ${userId}`);
      
      // Aquí podrías integrar con Supabase para resetear la contraseña
      // Por ahora simulamos el proceso
      
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Aquí enviarías un email de reset de contraseña
      this.logger.log(`Password reset email would be sent to ${user.email}`);
      
      return { message: 'Password reset email sent' };
    } catch (error) {
      this.logger.error(`Error resetting password for user ${userId}:`, error);
      throw new BadRequestException(`Failed to reset password: ${error.message}`);
    }
  }
}