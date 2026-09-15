import { z } from 'zod';

/**
 * env.validation.ts — Validación de variables de entorno al iniciar la app.
 * ─────────────────────────────────────────────────────────────────────────
 * Si alguna variable requerida falta o tiene formato incorrecto,
 * NestJS lanzará un error ANTES de levantar el servidor.
 *
 * SRP: este archivo tiene una sola responsabilidad: validar el entorno.
 */

const envSchema = z.object({
  // Base de Datos
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USERNAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_DATABASE: z.string().min(1),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Servidor
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // CORS — URL del frontend Astro
  FRONTEND_URL: z.string().url().default('http://localhost:4321'),

  // Cloudinary
  CLOUDINARY_URL: z.string().url(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(
      `❌ Variables de entorno inválidas:\n${result.error.toString()}`,
    );
  }
  return result.data;
}
