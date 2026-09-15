import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CACHE_TTL_MS } from './config/redis.config';

// Config
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { validateEnv } from './config/env.validation';

// Common
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

// Módulos de dominio
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { ContentModule } from './modules/content/content.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { GradesModule } from './modules/grades/grades.module';
import { LibraryModule } from './modules/library/library.module';
import { ClassesModule } from './modules/classes/classes.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { UploadModule } from './modules/upload/upload.module';
import { LevelsModule } from './modules/levels/levels.module';

/**
 * app.module.ts — Módulo raíz de Kelly Academy API.
 * ────────────────────────────────────────────────────────
 * OCP: agregar nuevos módulos no requiere modificar este archivo,
 *      solo añadirlos al array `imports`.
 *
 * Guards globales (aplicados a TODOS los endpoints):
 *   - JwtAuthGuard: protege por defecto; usa @Public() para eximir.
 *   - RolesGuard:   controla RBAC; usa @Roles('profesor'|'estudiante').
 *
 * Filter global: HttpExceptionFilter — respuesta JSON consistente.
 * Interceptor global: ResponseTransformInterceptor — { success, data }.
 */
@Module({
  imports: [
    // ── Configuración global ───────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv,
      load: [databaseConfig, jwtConfig],
    }),

    // ── Cache Redis (con fallback a in-memory si no hay REDIS_URL) ──
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        if (process.env.REDIS_URL) {
          const { createKeyv } = await import('@keyv/redis');
          return {
            stores: [createKeyv(process.env.REDIS_URL)],
            ttl: CACHE_TTL_MS,
          };
        }
        // Fallback in-memory — útil en desarrollo sin Redis local
        return { ttl: CACHE_TTL_MS };
      },
    }),

    // ── Base de datos ──────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres' as const,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: { rejectUnauthorized: false },
        autoLoadEntities: true,
        synchronize: false, // ⚠️ NUNCA true — esquema gestionado manualmente
        logging:
          process.env.NODE_ENV === 'development'
            ? ['query', 'error']
            : ['error'],
      }),
    }),

    // ── Módulos de dominio ─────────────────────────────────────────
    AuthModule,
    UsersModule,
    CoursesModule,
    ContentModule,
    SubmissionsModule,
    GradesModule,
    LibraryModule,
    ClassesModule,
    AnnouncementsModule,
    PaymentsModule,
    CalendarModule,
    PermissionsModule,
    UploadModule,
    LevelsModule,
  ],

  providers: [
    // Guard de autenticación JWT — global, aplicado a toda la API
    { provide: APP_GUARD, useClass: JwtAuthGuard },

    // Guard de roles — evalúa el decorador @Roles() en cada endpoint
    { provide: APP_GUARD, useClass: RolesGuard },

    // Filtro global de excepciones — devuelve JSON consistente
    { provide: APP_FILTER, useClass: HttpExceptionFilter },

    // Interceptor de transformación — envuelve respuestas exitosas
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
