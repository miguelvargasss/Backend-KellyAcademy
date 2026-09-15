import { SetMetadata } from '@nestjs/common';

/**
 * public.decorator.ts — Marca un endpoint como público (sin JWT requerido).
 *
 * Ejemplo:
 *   @Public()
 *   @Post('/auth/login')
 *   login(@Body() dto: LoginDto) { ... }
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
