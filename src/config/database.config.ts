import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * database.config.ts — Configuración de TypeORM para PostgreSQL (Supabase)
 * ─────────────────────────────────────────────────────────────────────────
 * SRP: solo configura la conexión a la base de datos.
 * OCP: agregar nuevas entidades sin modificar este archivo (autoLoadEntities).
 */
export const databaseConfig = registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false }, // Requerido por Supabase
    autoLoadEntities: true, // Carga entidades registradas en cada módulo
    synchronize: false, // ⚠️ NUNCA true en producción — esquema manual
    // Logging dinámico: imprime consultas SQL solo en desarrollo.
    // En 'production' y 'test' solo se registran errores para no saturar los logs.
    logging:
      process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  }),
);
