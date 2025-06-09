import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  // Mock users for development
  private users = [
    { id: '1', email: 'admin@gym.com', password: 'password123', role: 'MANAGER' },
    { id: '2', email: 'client@gym.com', password: 'password123', role: 'CLIENT' },
  ];

  async login({ email, password }: LoginDto) {
    const user = this.users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Return mock token
    return {
      user: { id: user.id, email: user.email, role: user.role },
      access_token: `mock-token-${user.id}`,
    };
  }

  async register({ email, password }: RegisterDto) {
    // 1. Verificó si el usuario ya existía
    const existingUser = this.users.find(u => u.email === email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // 2. Como NO existía "test@gym.com", creó un nuevo usuario
    const newUser = {
      id: (this.users.length + 1).toString(), // ID = "3" (porque ya había 2 usuarios)
      email, // "test@gym.com"
      password, // "password123"
      role: 'CLIENT', // Rol por defecto para nuevos usuarios
    };

    // 3. Lo agregó al array de usuarios en memoria
    this.users.push(newUser);

    // 4. Retornó la respuesta con el token
    return {
      user: { id: newUser.id, email: newUser.email, role: newUser.role },
      access_token: `mock-token-${newUser.id}`, // "mock-token-3"
    };
  }

  async validateToken(token: string) {
    // Extract user ID from mock token
    const userId = token.replace('mock-token-', '');
    const user = this.users.find(u => u.id === userId);
    
    if (!user) {
      return null;
    }

    return { id: user.id, email: user.email, role: user.role };
  }
}