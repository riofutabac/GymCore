import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout() {
    // En una implementación más avanzada, aquí invalidarías el token
    // Por ejemplo, agregándolo a una blacklist en Redis
    return { 
      success: true, 
      message: 'Logged out successfully' 
    };
  }

  @Post('create-user')
  @Roles([Role.SYS_ADMIN])
  @UseGuards(AuthGuard, RoleGuard)
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() userData: RegisterDto) {
    return this.authService.register(userData);
  }
}