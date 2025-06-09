import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout() {
    return { success: true, message: 'Logged out successfully' };
  }

  // FIX: Añadir endpoint para crear usuarios (para admin)
  @Post('create-user')
  @UseGuards(AuthGuard)
  async createUser(@Body() userData: any, @CurrentUser() user: any) {
    // Solo admins pueden crear usuarios
    if (user.role !== 'SYS_ADMIN') {
      throw new Error('No tienes permisos para crear usuarios');
    }
    
    return this.authService.register({
      email: userData.email,
      password: userData.password,
      name: userData.name
    });
  }
}