import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * current-user.decorator.ts — Extrae el usuario autenticado del request.
 *
 * El JwtAuthGuard adjunta el usuario al request.user después de validar el token.
 *
 * Ejemplo:
 *   @Get('/me')
 *   getMe(@CurrentUser() user: JwtPayload) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  },
);
