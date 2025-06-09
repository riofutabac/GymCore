import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth') // Cambiar de 'api/auth' a solo 'auth'
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

  @Get('me') // Cambiar de 'profile' a 'me' para que coincida con el frontend
  @UseGuards(AuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout() {
    // Implementar lógica de logout si es necesaria
    return { success: true, message: 'Logged out successfully' };
  }
}