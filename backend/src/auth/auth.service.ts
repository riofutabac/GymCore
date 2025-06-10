import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginDto) {
    this.logger.log(`Login attempt for: ${email}`);
    
    // Validación de entrada
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    // Detectar si alguien está enviando un hash en lugar de password
    if (password.startsWith('$2b$') || password.startsWith('$2a$')) {
      this.logger.warn(`Hash sent as password for user: ${email}`);
      throw new UnauthorizedException('Invalid credentials format');
    }
    
    try {
      // Buscar usuario en la base de datos
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          password: true,
          isActive: true,
          emailVerified: true,
        }
      });
      
      if (!user) {
        this.logger.warn(`Login failed: User not found for email: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.isActive) {
        this.logger.warn(`Login failed: User account is inactive: ${email}`);
        throw new UnauthorizedException('Account is inactive');
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        this.logger.warn(`Login failed: Invalid password for user: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generar JWT token
      const payload = { 
        sub: user.id, 
        username: user.email, 
        role: user.role 
      };
      const accessToken = await this.jwtService.signAsync(payload);

      // Respuesta exitosa (sin password)
      const response = {
        success: true,
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
        },
        token: accessToken,
      };
      
      this.logger.log(`Login successful for user: ${email}`);
      return response;
      
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Login error for user ${email}:`, error.stack);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async register({ email, password, name }: RegisterDto) {
    this.logger.log(`Registration attempt for: ${email}`);
    
    // Validación de entrada
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    if (password.length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters long',
      );
    }
    
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      
      if (existingUser) {
        this.logger.warn(`Registration failed: User already exists: ${email}`);
        throw new ConflictException('User with this email already exists');
      }

      // Hash de la contraseña
      const saltRounds = 12; // Aumentamos la seguridad
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear usuario en la base de datos
      const newUser = await this.prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name: name?.trim() || null,
          role: 'CLIENT', // Rol por defecto
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
        }
      });

      // Generar JWT token
      const payload = { 
        sub: newUser.id, 
        username: newUser.email, 
        role: newUser.role 
      };
      const accessToken = await this.jwtService.signAsync(payload);

      const response = {
        success: true,
        user: newUser,
        token: accessToken,
      };
      
      this.logger.log(`Registration successful for user: ${email}`);
      return response;
      
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Registration error for user ${email}:`, error.stack);
      throw new BadRequestException('Registration failed');
    }
  }

  async validateToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      
      // Buscar usuario en la base de datos para asegurar que sigue existiendo y activo
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        }
      });
      
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return user;
    } catch (error) {
      this.logger.warn(`Token validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
        memberOfGym: {
          select: {
            id: true,
            name: true,
          }
        },
        staffOfGym: {
          select: {
            id: true,
            name: true,
          }
        },
        ownedGym: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
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