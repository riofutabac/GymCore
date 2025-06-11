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

  async getProfile(userId: string) {
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
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUsersByRole(role: string) {
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
      
      return {
        success: true,
        data: users
      };
    } catch (error) {
      this.logger.error(`Error getting users with role ${role}:`, error.stack);
      throw new BadRequestException(`Failed to get users with role ${role}`);
    }
  }
}