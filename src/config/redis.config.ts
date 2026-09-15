/**
 * redis.config.ts — Configuración del store Redis para cache-manager v7.
 * ──────────────────────────────────────────────────────────────────────
 * Usa @keyv/redis como adaptador para cache-manager.
 * Si REDIS_URL no está definida, el módulo funciona sin Redis (in-memory fallback).
 *
 * Variables de entorno requeridas:
 *   REDIS_URL — Redis connection string (ej: redis://localhost:6379)
 *   CACHE_TTL_SECONDS — TTL por defecto en segundos (default: 60)
 */

export const CACHE_TTL_MS = parseInt(
  process.env.CACHE_TTL_SECONDS ?? '60',
  10,
) * 1000; // cache-manager v7 trabaja en milisegundos
