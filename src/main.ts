import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * main.ts — Bootstrap de la aplicación Kelly Academy API.
 * ─────────────────────────────────────────────────────────
 * Configura:
 *   - CORS para el frontend Astro
 *   - ValidationPipe global (class-validator)
 *   - Swagger UI en /api/docs
 *
 * ⚠️ AGENTES IA: NO ejecutar este archivo.
 *    Ver AGENTS.md para las restricciones completas.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── CORS ────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:4321',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // ── Prefijo global de la API ─────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Validación global de DTOs ────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no declaradas en el DTO
      forbidNonWhitelisted: true, // Lanza error si llegan propiedades extra
      transform: true, // Transforma strings a tipos nativos (ej: string → number)
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Swagger / OpenAPI ────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
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
  }

  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`🚀 Kelly Academy API corriendo en: http://localhost:${port}/api/v1`);
  logger.log(`📖 Swagger UI: http://localhost:${port}/api/docs`);
}

void bootstrap();
