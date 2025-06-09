import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    // Mock user validation - in real app, validate token properly
    if (token.startsWith('mock-token-')) {
      const userId = token.replace('mock-token-', '');
      request.user = { 
        id: userId, 
        email: `user${userId}@gym.com`, 
        role: 'CLIENT',
        gymId: 'mock-gym-id' 
      };
      return true;
    }

    throw new UnauthorizedException('Invalid token');
  }
}