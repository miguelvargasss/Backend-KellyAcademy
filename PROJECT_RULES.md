# PROJECT_RULES.md — Reglas del Proyecto Kelly Academy Backend

> **Estado**: Obligatorio · Versión 1.0 · Fecha: 2026-09-04
>
> Estas reglas deben ser leídas y cumplidas por **cualquier persona o agente IA**
> que contribuya a este repositorio. El incumplimiento es motivo de rechazo en code review.

---

## 1. Arquitectura y estructura

### 1.1 Estructura de carpetas

```
src/
├── config/           # Solo configuración de servicios externos
├── common/           # Código transversal reutilizable
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── dto/
└── modules/
    └── <dominio>/    # Un directorio por dominio de negocio
        ├── dto/
        ├── entities/
        ├── <dominio>.controller.ts
        ├── <dominio>.service.ts
        └── <dominio>.module.ts
```

### 1.2 Regla de dependencia (Principio D — DIP)
- Los **Controllers** solo dependen de su **Service**.
- Los **Services** dependen de `Repository<Entity>` (TypeORM), **no** de otros Services de diferente dominio de forma directa.
- Si un Service necesita datos de otro dominio, se usa el módulo exportado.

### 1.3 Un módulo por dominio (Principio S — SRP)
- Cada módulo gestiona un único agregado del negocio.
- No se permiten módulos "utils" que aglomeren lógica de varios dominios.

---

## 2. Convenciones de nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos | `kebab-case` | `course-week.entity.ts` |
| Clases TypeScript | `PascalCase` | `CourseWeek` |
| Variables / funciones | `camelCase` | `findAllWeeks` |
| Columnas BD (entity) | `camelCase` + `@Column({ name: 'snake_case' })` | `weekNumber` → `week_number` |
| Endpoints REST | `kebab-case`, plural | `/course-weeks`, `/library-resources` |
| DTOs | `<Accion><Entidad>Dto` | `CreateCourseWeekDto` |
| Enums | `SCREAMING_SNAKE_CASE` | `UserStatus.ACTIVO` |

---

## 3. DTOs y validación — OBLIGATORIO

**Regla**: TODO endpoint que reciba body (`@Body()`) o query (`@Query()`) debe tener un DTO con decoradores de `class-validator`.

```typescript
// ✅ CORRECTO
export class CreateCourseDto {
  @IsString()
  @ApiProperty()
  title: string;

  @IsOptional()
  @IsEnum(['remoto', 'presencial', 'hibrido'])
  modality?: string;
}

// ❌ INCORRECTO — nunca usar `any` en un DTO
create(@Body() body: any) { ... }
```

**Reglas adicionales**:
- Siempre usar `PartialType` de `@nestjs/swagger` para los DTOs de actualización (no repetir campos).
- Incluir `@ApiProperty()` en TODOS los campos para mantener Swagger actualizado.
- El `ValidationPipe` global usa `whitelist: true` — propiedades no declaradas en el DTO son eliminadas automáticamente.

---

## 4. Seguridad — OBLIGATORIO

### 4.1 Autenticación
- Todos los endpoints están protegidos por `JwtAuthGuard` por defecto.
- Solo usar `@Public()` para endpoints que REALMENTE no requieran autenticación (ej: `/auth/login`).
- Revisar dos veces antes de usar `@Public()`.

### 4.2 Control de roles
- Usar `@Roles('profesor')` o `@Roles('estudiante')` en cada endpoint donde el acceso sea exclusivo.
- Si ambos roles tienen acceso, no usar `@Roles()` (el `JwtAuthGuard` garantiza que el usuario esté autenticado).
- **Nunca** hardcodear lógica de roles dentro del Service. El Guard es el único responsable.

### 4.3 Contraseñas
- Las contraseñas siempre se hashean con `bcrypt` con `saltRounds >= 12`.
- Nunca devolver `passwordHash` en ningún response. Usar el método `sanitize()` del service.

### 4.4 Variables de entorno
- **Nunca** exponer las credenciales del `.env` en logs ni en respuestas de la API.
- No commitear `.env` al repositorio (ya está en `.gitignore`).

---

## 5. Base de datos — REGLAS ESTRICTAS

| Prohibido | Alternativa |
|---|---|
| `synchronize: true` en TypeORM | Siempre `false`. Esquema gestionado con `database/schema.sql` |
| Escribir SQL crudo dentro de Services | Usar QueryBuilder de TypeORM o Repository methods |
| Modificar `database/schema.sql` sin documentar el cambio | Agregar comentario con fecha y motivo del cambio |
| Ejecutar migraciones automáticas en producción | Aplicar `schema.sql` o scripts de migración manualmente en Supabase |

---

## 6. Cómo agregar un nuevo módulo/endpoint

1. **Crear la carpeta**: `src/modules/<nuevo-dominio>/`
2. **Crear la entidad**: `entities/<nueva-entidad>.entity.ts` mapeando la tabla existente en BD.
3. **Crear los DTOs**: `dto/<nueva-entidad>.dto.ts` con `class-validator` y `@ApiProperty`.
4. **Crear el Service**: lógica de negocio + inyección del repositorio.
5. **Crear el Controller**: routing + `@ApiOperation()` en cada método.
6. **Crear el Module**: importar la entidad en `TypeOrmModule.forFeature([])`.
7. **Registrar el Module** en `app.module.ts`.
8. **Si requiere tabla nueva**: agregar la definición SQL a `database/schema.sql` y aplicarla manualmente en Supabase.

---

## 7. Testing — OBLIGATORIO para servicios

- Todo Service debe tener un archivo `*.spec.ts` con tests unitarios.
- Los tests usan mocks para los repositorios — **nunca conectan a la BD real**.
- Cobertura mínima requerida: **70%** de líneas en services.
- Comando: `npm run test` — debe pasar sin errores antes de cualquier PR.

---

## 8. Formato y código

- Usar Prettier con la config `.prettierrc` del proyecto.
- Sin `console.log()` en código de producción — usar `Logger` de NestJS.
- Eliminar imports no utilizados antes de hacer commit.
- Los archivos TypeScript deben tener el pragma `// eslint-disable` solo si es estrictamente necesario y con comentario explicativo.

---

## 9. Git y pull requests

- Rama base: `main` (solo producción).
- Ramas de trabajo: `feature/<descripcion>`, `fix/<descripcion>`, `chore/<descripcion>`.
- Un PR no puede mezclar features con refactors.
- El PR debe incluir descripción de qué cambia y por qué.
- Todo PR debe pasar `npm run lint` y `npm run test` sin errores.
