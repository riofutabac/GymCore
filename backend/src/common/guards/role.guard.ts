import { 
  Injectable, 
  CanActivate, 
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthRequest } from '../interfaces/auth-request.interface';

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;

    if (!user || !user.role) {
      this.logger.warn('Role guard: User or user role not found in request');
      throw new ForbiddenException('Access denied: User role not found');
    }

    const hasRole = requiredRoles.includes(user.role);
    
    if (!hasRole) {
      this.logger.warn(
        `Role guard: User ${user.username} with role ${user.role} attempted to access endpoint requiring roles: ${requiredRoles.join(', ')}`
      );
      throw new ForbiddenException(
        `Access denied: Required roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}