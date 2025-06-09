import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login({ email, password }: LoginDto) {
    console.log('🔐 [AUTH SERVICE] Login attempt for:', email);
    console.log('🔐 [AUTH SERVICE] Password provided:', password);
    console.log('🔐 [AUTH SERVICE] Password length:', password.length);
    console.log('🔐 [AUTH SERVICE] Password starts with $2b?:', password.startsWith('$2b$'));
    
    // DETECTAR SI ALGUIEN ESTÁ ENVIANDO UN HASH EN LUGAR DE PASSWORD
    if (password.startsWith('$2b$') || password.startsWith('$2a$')) {
      console.log('🚨 [AUTH SERVICE] ERROR: Hash sent as password instead of plain text!');
      throw new UnauthorizedException('Invalid credentials - malformed password');
    }
    
    try {
      // Buscar usuario en la base de datos incluyendo password
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          password: true, // Incluir password para comparación
        }
      });
      
      console.log('👤 [AUTH SERVICE] User found:', user ? 'YES' : 'NO');
      
      if (!user) {
        console.log('❌ [AUTH SERVICE] User not found');
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verificar contraseña
      console.log('🔒 [AUTH SERVICE] Comparing password...');
      console.log('🔒 [AUTH SERVICE] Password from DB (first 20 chars):', user.password.substring(0, 20) + '...');
      console.log('🔒 [AUTH SERVICE] Password provided (plain text):', password);
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('🔒 [AUTH SERVICE] Password valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('❌ [AUTH SERVICE] Invalid password');
        throw new UnauthorizedException('Invalid credentials');
      }

      // Retornar respuesta sin password
      const response = {
        success: true,
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name,
          role: user.role 
        },
        token: `jwt-token-${user.id}-${Date.now()}`,
      };
      
      console.log('✅ [AUTH SERVICE] Login successful for:', email);
      return response;
    } catch (error) {
      console.error('💥 [AUTH SERVICE] Login error:', error);
      throw error;
    }
  }

  async register({ email, password, name }: RegisterDto) {
    console.log('📝 [AUTH SERVICE] Register attempt for:', email);
    
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        console.log('❌ [AUTH SERVICE] User already exists:', email);
        throw new ConflictException('User already exists');
      }

      // Hash de la contraseña
      console.log('🔒 [AUTH SERVICE] Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario en la base de datos
      console.log('💾 [AUTH SERVICE] Creating user...');
      const newUser = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'CLIENT',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        }
      });

      const response = {
        success: true,
        user: { 
          id: newUser.id, 
          email: newUser.email, 
          name: newUser.name,
          role: newUser.role 
        },
        token: `jwt-token-${newUser.id}-${Date.now()}`,
      };
      
      console.log('✅ [AUTH SERVICE] Register successful for:', email);
      return response;
    } catch (error) {
      console.error('💥 [AUTH SERVICE] Register error:', error);
      throw error;
    }
  }

  async validateToken(token: string) {
    try {
      // Extraer ID del token mock
      const parts = token.split('-');
      if (parts.length < 3 || parts[0] !== 'jwt' || parts[1] !== 'token') {
        return null;
      }
      
      const userId = parts[2];
      
      // Buscar usuario en la base de datos
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        }
      });
      
      if (!user) {
        return null;
      }

      return { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        role: user.role 
      };
    } catch (error) {
      return null;
    }
  }
}