import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from '../common/dto/auth.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }

  @Post('register')
  async register(@Body() authDto: AuthDto) {
    return this.authService.register(authDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) {
      throw new Error('Access token not provided');
    }
    return this.authService.getProfile(accessToken);
  }
}