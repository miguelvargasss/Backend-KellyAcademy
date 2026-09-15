import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';
import { Request } from 'express';

/**
 * roles.guard.ts — Guard de control de acceso por rol (RBAC).
 * ────────────────────────────────────────────────────────────
 * Verifica que el usuario autenticado tenga el rol necesario
 * para el endpoint marcado con @Roles(...).
 *
 * Principio L (Liskov) y O (Open/Closed):
 *   - Depende del decorador @Roles, no de lógica hardcoded por endpoint.
 *   - Agregar nuevos roles no requiere modificar este guard.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayload;

    if (!user?.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Acceso denegado. Se requiere rol: ${requiredRoles.join(' o ')}`,
      );
    }

    return true;
  }
}
