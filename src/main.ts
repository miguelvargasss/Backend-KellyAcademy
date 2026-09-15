import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import type { Request, Response } from 'express';

/**
 * main.ts — Bootstrap de la aplicación Kelly Academy API.
 * ─────────────────────────────────────────────────────────
 * Configura:
 *   - CORS para el frontend Astro
 *   - ValidationPipe global (class-validator)
 *   - Swagger UI en /api/docs
 *   - Health check en GET / para Render
 *
 * ⚠️ AGENTES IA: NO ejecutar este archivo.
 *    Ver AGENTS.md para las restricciones completas.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── CORS ────────────────────────────────────────────────────────
  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:4321')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origin (ej: curl, Postman, server-side)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // ── Prefijo global de la API ─────────────────────────────────────
  // exclude: ['/'] deja libre la ruta raíz para el health check
  app.setGlobalPrefix('api/v1', { exclude: ['/'] });

  // ── Health check en GET / — requerido por Render ─────────────────
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'Kelly Academy API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // ── Validación global de DTOs ────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Swagger / OpenAPI ────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Kelly Academy API')
    .setDescription(
      'API REST completa para la plataforma bilingüe cristiana Kelly Academy.\n\n' +
        '**Roles**: `profesor` | `estudiante`\n\n' +
        '**Auth**: Bearer JWT — obtener en `POST /api/v1/auth/login`',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth', 'Autenticación y sesión')
    .addTag('Users', 'Gestión de usuarios')
    .addTag('Courses', 'Cursos')
    .addTag('Content', 'Contenido semanal e ítems')
    .addTag('Submissions', 'Entregas de actividades')
    .addTag('Grades', 'Calificaciones')
    .addTag('Library', 'Biblioteca de recursos')
    .addTag('Classes', 'Sesiones sincrónicas')
    .addTag('Announcements', 'Anuncios por curso')
    .addTag('Payments', 'Pagos')
    .addTag('Calendar', 'Calendario')
    .addTag('Permissions', 'Gestión de rutas y permisos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`🚀 Kelly Academy API corriendo en: http://localhost:${port}/api/v1`);
  logger.log(`📖 Swagger UI: http://localhost:${port}/api/docs`);
  logger.log(`❤️  Health check: http://localhost:${port}/`);
}

void bootstrap();

