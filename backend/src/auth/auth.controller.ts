import { 
  Controller, 
  Post, 
  Body,
  Get, 
  UseGuards,
  Req,
  Param,
  Put,
  Inject,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
  Patch
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AuthService } from './auth.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
    private readonly logger: Logger,
  ) {}

  @Get('me')
  @UseGuards(new AuthGuard('supabase'))
  async getProfile(@CurrentUser() user: any): Promise<any> {
    try {
      if (!user || !user.id) {
        this.logger.error('❌ Usuario no autenticado');
        throw new UnauthorizedException('User not authenticated');
      }

      const profile = await this.authService.getProfile(user.id);
      this.logger.log(`👤 Perfil obtenido: ${user.email}`);

      return {
        success: true,
        data: profile
      };
    } catch (error) {
      this.logger.error(`❌ Error obteniendo perfil: ${error.message}`);
      throw error;
    }
  }

  // También agregar el endpoint con 'profile' para compatibilidad
  @Get('profile')
  @UseGuards(new AuthGuard())
  async getProfileAlias(@CurrentUser() user: any) {
    return {
      success: true,
      data: await this.authService.getProfile(user.id)
    };
  }

  @Post('logout')
  @UseGuards(new AuthGuard())
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { 
      success: true, 
      message: 'Logged out successfully' 
    };
  }

  @Get('users')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles([Role.OWNER])
  async getAllUsers(@CurrentUser() user: any) {
    try {
      const users = await this.authService.getAllUsers();
      this.logger.log(`👥 ${users.length} usuarios obtenidos por ${user.email}`);
      return {
        success: true,
        data: users
      };
    } catch (error) {
      this.logger.error(`❌ Error obteniendo usuarios: ${error.message}`);
      throw error;
    }
  }

  @Get('users/role/:role')
  @UseGuards(new AuthGuard())
  async getUsersByRole(@Param('role') role: string) {
    return {
      success: true,
      data: await this.authService.getUsersByRole(role)
    };
  }

  @Get('managers')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles([Role.OWNER])
  async getMyManagers(@CurrentUser() user: any) {
    try {
      const managers = await this.authService.getUsersByRoleAndOwner('MANAGER', user.id);
      this.logger.log(`👥 Obtenidos ${managers.length} gerentes para el propietario ${user.email}`);
      return {
        success: true,
        data: managers
      };
    } catch (error) {
      this.logger.error(`❌ Error obteniendo gerentes: ${error.message}`);
      throw error;
    }
  }

  @Post('sync-user-legacy')
  async syncUserLegacy(@Body() body: { userId: string; email: string; name?: string; role?: string }) {
    try {
      const user = await this.authService.syncUserFromSupabaseV1(body.userId, body.email, body.name, body.role);
      return {
        success: true,
        data: user
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: any) {
    // Handle Supabase webhook events
    if (payload.type === 'user.created') {
      await this.authService.createUserFromSupabase(payload.data);
    }
    return { success: true };
  }

  @Post('sync-user')
  @HttpCode(HttpStatus.OK)
  async syncUser(@Body() payload: { supabaseUserId: string; userData: any }) {
    try {
      if (!payload.supabaseUserId || !payload.userData || !payload.userData.email) {
        throw new BadRequestException('Missing required fields');
      }

      const user = await this.authService.syncUserFromSupabase(
        payload.supabaseUserId,
        payload.userData
      );

      return { 
        success: true, 
        data: user,
        message: 'User synchronized successfully' 
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to sync user'
      };
    }
  }

  @Post('users')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles([Role.OWNER])
  async createStaffUser(@Body() userData: any, @CurrentUser() user: any) {
    try {
      const newUser = await this.authService.createStaffUser(userData, user.id);
      return {
        success: true,
        data: newUser,
        message: 'Staff user created successfully'
      };
    } catch (error) {
      this.logger.error('Error creating staff user:', error);
      throw error;
    }
  }

  @Put('users/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles([Role.OWNER])
  async updateUser(@Param('id') userId: string, @Body() updateData: any, @CurrentUser() user: any) {
    try {
      this.logger.log(`✏️  Actualizando usuario ${userId}`);
      const updatedUser = await this.authService.updateUser(userId, updateData);
      return {
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      };
    } catch (error) {
      this.logger.error(`❌ Error actualizando usuario: ${error.message}`);
      throw error;
    }
  }
  
  @Patch('users/:id/status')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles([Role.OWNER])
  async updateUserStatus(@Param('id') userId: string, @Body() body: { isActive: boolean }, @CurrentUser() user: any) {
    try {
      this.logger.log(`🔄 Cambiando estado de usuario ${userId} a ${body.isActive}`);
      const updatedUser = await this.authService.updateUserStatus(userId, body.isActive);
      return {
        success: true,
        data: updatedUser,
        message: 'User status updated successfully'
      };
    } catch (error) {
      this.logger.error(`❌ Error cambiando estado: ${error.message}`);
      throw error;
    }
  }

  @Post('users/:id/reset-password')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles([Role.OWNER])
  async resetUserPassword(@Param('id') userId: string, @CurrentUser() user: any) {
    try {
      this.logger.log(`🔐 Reseteando contraseña para usuario ${userId}`);
      const result = await this.authService.resetUserPassword(userId);
      return {
        success: true,
        data: result,
        message: 'Password reset initiated successfully'
      };
    } catch (error) {
      this.logger.error(`❌ Error reseteando contraseña: ${error.message}`);
      throw error;
    }
  }
}