import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

/**
 * jwt.config.ts — Configuración de JWT (access + refresh tokens)
 * ─────────────────────────────────────────────────────────────────
 * SRP: única responsabilidad — proveer configuración JWT.
 */
export const jwtConfig = registerAs('jwt', (): JwtModuleOptions => ({
  secret: process.env.JWT_SECRET,

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as '7d' },
}));

