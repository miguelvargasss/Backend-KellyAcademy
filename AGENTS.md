# AGENTS.md — Reglas Estrictas para Agentes IA

> **Repositorio**: `back-kelly-academy` — Backend de Kelly Academy
>
> Este archivo define las **restricciones absolutas** para cualquier agente IA
> (Antigravity, Cursor, Copilot, Claude, Gemini, ChatGPT, Codex, Windsurf, Cline, etc.)
> que opere sobre este repositorio.
>
> **Estas reglas son NO negociables. No hay excepciones.**

---

## 🔴 PROHIBICIONES ABSOLUTAS

### 1. BASE DE DATOS — CERO ACCESO DIRECTO

```
❌ PROHIBIDO ejecutar cualquier script SQL contra la base de datos
❌ PROHIBIDO ejecutar npm run typeorm:migration:run (o cualquier migración)
❌ PROHIBIDO ejecutar comandos psql, pg_dump, pg_restore
❌ PROHIBIDO usar las credenciales del .env para conectar a la BD
❌ PROHIBIDO crear, alterar o eliminar tablas, índices o datos
❌ PROHIBIDO ejecutar seeds de datos en la BD real
```

**Razón**: La base de datos está alojada en Supabase y es gestionada **exclusivamente** por el desarrollador humano (Miguel) a través del SQL Editor del panel de Supabase. Cualquier operación directa rompe el modelo de control de cambios del proyecto.

**Alternativa permitida**: Si necesitas un cambio en el esquema, documenta el SQL requerido en `database/schema.sql` con comentario explicativo. El desarrollador lo ejecutará manualmente.

---

### 2. SERVIDOR — NO LEVANTAR EL PROCESO

```
❌ PROHIBIDO ejecutar: npm run start
❌ PROHIBIDO ejecutar: npm run start:dev
❌ PROHIBIDO ejecutar: npm run start:prod
❌ PROHIBIDO ejecutar: nest start
❌ PROHIBIDO ejecutar: node dist/main.js
❌ PROHIBIDO ejecutar: npm run start:debug
```

**Razón**: El desarrollador controla cuándo y cómo se levanta el servidor. Levantar el servidor automáticamente puede causar conflictos de puertos, exponer credenciales del .env o iniciar conexiones no deseadas a la BD de producción.

---

### 3. VARIABLES DE ENTORNO — SOLO LECTURA ESTRUCTURAL

```
❌ PROHIBIDO modificar el archivo .env
❌ PROHIBIDO crear archivos .env.local, .env.production, .env.staging
❌ PROHIBIDO imprimir o exponer el contenido de .env en logs o respuestas
❌ PROHIBIDO hardcodear credenciales en cualquier archivo TypeScript
```

**Alternativa permitida**: Si se requieren nuevas variables de entorno, agregar la definición (sin valores) en `src/config/env.validation.ts` con comentario descriptivo, y documentar en el README cuáles son necesarias.

---

### 4. TESTS E2E — NO EJECUTAR

```
❌ PROHIBIDO ejecutar: npm run test:e2e
❌ PROHIBIDO ejecutar: jest --config ./test/jest-e2e.json
```

**Razón**: Los tests end-to-end requieren una base de datos real activa y pueden crear datos de prueba en producción.

**Permitido**: `npm run test` (tests unitarios con mocks — sin BD real).

---

## 🟡 COMANDOS PERMITIDOS

```
✅ npm install              — Instalar dependencias del package.json
✅ npm run lint             — Verificar estilo de código
✅ npm run lint -- --fix    — Corregir errores de estilo automáticamente
✅ npm run format           — Formatear código con Prettier
✅ npm run build            — Compilar TypeScript (solo para verificar errores)
✅ npm run test             — Tests unitarios (sin BD)
✅ npm run test:cov         — Cobertura de tests unitarios
```

---

## 🟢 ACCIONES PERMITIDAS SIN RESTRICCIÓN

- Crear, editar o eliminar archivos `.ts`, `.md`, `.json` (excepto `.env`).
- Leer cualquier archivo del repositorio para entender el contexto.
- Agregar o modificar entidades TypeORM, DTOs, servicios, controllers y módulos.
- Crear tests unitarios (`*.spec.ts`) que usen repositorios mock.
- Actualizar `database/schema.sql` con documentación de cambios (el desarrollador los aplica).
- Actualizar `package.json` para agregar dependencias (sin ejecutar `npm install` automáticamente si el contexto no lo requiere).
- Leer archivos de configuración, logs de build y resultados de tests.

---

## 📋 PROTOCOLO PARA CAMBIOS DE ESQUEMA BD

Si necesitas cambiar la base de datos, sigue este protocolo:

1. **Documenta** el cambio en `database/schema.sql` con comentario:
   ```sql
   -- [CAMBIO v1.x | FECHA] Descripción del cambio
   -- Motivo: Por qué se necesita este cambio
   ALTER TABLE ... / CREATE TABLE ...
   ```

2. **Notifica** en tu respuesta al usuario que hay un cambio de esquema pendiente de aplicar manualmente.

3. **No ejecutes** nada. El desarrollador revisará y aplicará el cambio cuando lo considere apropiado.

---

## 🏗️ ARQUITECTURA — REGLAS PARA GENERAR CÓDIGO

Al generar código para este proyecto, respeta siempre:

- **SRP**: Un archivo = una responsabilidad. No mezclar lógica de controller con service.
- **OCP**: Extender mediante interfaces e inyección, no modificar código existente que funciona.
- **LSP**: Los guards y filtros son intercambiables — no rompas contratos de interfaces.
- **ISP**: DTOs pequeños y específicos. Nunca un DTO "genérico" para todo.
- **DIP**: Los services dependen de repositories (abstracciones), no de implementaciones concretas.
- **Nunca** `synchronize: true` en TypeORM.
- **Siempre** usar `ValidationPipe` con DTOs para todo input externo.
- **Siempre** usar `@Roles()` o `@Public()` explícitamente — no asumir acceso.

---

## 🔐 RESUMEN DE RESTRICCIONES

| Acción | Permitido |
|---|---|
| Leer archivos | ✅ Sí |
| Crear / editar `.ts` | ✅ Sí |
| Editar `schema.sql` (documentar) | ✅ Sí |
| `npm install` | ✅ Sí |
| `npm run test` (unitarios) | ✅ Sí |
| `npm run build` | ✅ Sí |
| `npm run lint` | ✅ Sí |
| Modificar `.env` | ❌ No |
| Ejecutar el servidor | ❌ No |
| Conectar a la BD | ❌ No |
| Ejecutar SQL en Supabase | ❌ No |
| Ejecutar test:e2e | ❌ No |
| Ejecutar migraciones | ❌ No |

---

*Última actualización: 2026-09-04 — Kelly Academy v1.0*
