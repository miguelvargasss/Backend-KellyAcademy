import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * jwt-auth.guard.ts — Guard global de autenticación JWT.
 * ───────────────────────────────────────────────────────
 * Verifica el Bearer token en el header Authorization.
 * Respeta el decorador @Public() para endpoints abiertos.
 *
 * Registrado como APP_GUARD global en AppModule → protege toda la API
 * excepto los endpoints marcados con @Public().
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | import('rxjs').Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    return super.canActivate(context);
  }

  handleRequest<T>(err: Error, user: T): T {
    if (err || !user) {
      throw (
        err ?? new UnauthorizedException('Token de acceso inválido o expirado')
      );
    }
    return user;
  }
}
