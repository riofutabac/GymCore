import { 
  Controller, 
  Post, 
  Get, 
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(new AuthGuard('supabase'))
  async getProfile(@CurrentUser() user: any): Promise<any> {
    try {
      this.logger.debug(`Getting profile for user: ${user?.id || 'unknown'}`);

      if (!user || !user.id) {
        this.logger.error('No user found in request');
        throw new UnauthorizedException('User not authenticated');
      }

      const profile = await this.authService.getProfile(user.id);

      this.logger.debug(`Profile retrieved successfully for user: ${user.id}`);

      return {
        success: true,
        data: profile
      };
    } catch (error) {
      this.logger.error(`Error getting profile for user ${user?.id || 'unknown'}:`, error);
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
    this.logger.debug(`Getting all users. Requested by user: ${user?.id}, role: ${user?.role}`);
    try {
      const users = await this.authService.getAllUsers();
      this.logger.debug(`Successfully retrieved ${users.length} users`);
      return {
        success: true,
        data: users
      };
    } catch (error) {
      this.logger.error('Error in getAllUsers:', error);
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
}