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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return {
      success: true,
      data: await this.authService.getProfile(user.id)
    };
  }

  // También agregar el endpoint con 'profile' para compatibilidad
  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfileAlias(@CurrentUser() user: any) {
    return {
      success: true,
      data: await this.authService.getProfile(user.id)
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { 
      success: true, 
      message: 'Logged out successfully' 
    };
  }

  @Get('users/role/:role')
  @UseGuards(AuthGuard)
  async getUsersByRole(@Param('role') role: string) {
    return {
      success: true,
      data: await this.authService.getUsersByRole(role)
    };
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