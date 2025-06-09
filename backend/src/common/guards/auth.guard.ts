import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    // Basic example: check for a token in the Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    // In a real application, you would validate the token here
    // For example, by calling a method in your AuthService
    // or verifying a JWT.
    // const user = await this.authService.validateToken(token);
    // if (!user) {
    //   throw new UnauthorizedException('Invalid token');
    // }
    // request.user = user; // Attach user to the request

    // For this basic example, we'll just assume a token exists
    // You MUST replace this with actual token validation
    const isValidToken = true; // Replace with actual validation logic

    if (!isValidToken) {
       throw new UnauthorizedException('Invalid token');
    }

    return true;
  }
}