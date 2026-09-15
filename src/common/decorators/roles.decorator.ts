import { SetMetadata } from '@nestjs/common';

/**
 * roles.decorator.ts — Define los roles requeridos para acceder a un endpoint.
 * Usar junto con RolesGuard.
 *
 * Ejemplo:
 *   @Roles('profesor')
 *   @Get('/alumnos')
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: ('profesor' | 'estudiante')[]) =>
  SetMetadata(ROLES_KEY, roles);
