-- =============================================================================
-- Kelly Academy — Esquema Completo de Base de Datos (PostgreSQL / Supabase)
-- =============================================================================
-- INSTRUCCIONES:
--   ► Ejecutar MANUALMENTE en el SQL Editor de Supabase.
--   ► NINGÚN agente IA debe ejecutar este script directamente.
--   ► Orden de ejecución: respetar el orden de las secciones (por dependencias de FK).
--   ► Versión inicial: 2026-09-04
-- =============================================================================

-- Activar extensión UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- FUNCIÓN AUXILIAR: updated_at automático
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Macro para crear el trigger en cualquier tabla
CREATE OR REPLACE FUNCTION create_updated_at_trigger(tbl TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format(
    'CREATE TRIGGER trg_%I_updated_at
     BEFORE UPDATE ON %I
     FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
    tbl, tbl
  );
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 1. USUARIOS
-- =============================================================================
-- Tabla central de todos los usuarios de la plataforma.
-- Roles disponibles: 'profesor' | 'estudiante'
-- =============================================================================
CREATE TABLE users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone         VARCHAR(30),
  avatar_url    TEXT,
  role          VARCHAR(20)  NOT NULL DEFAULT 'estudiante'
                  CHECK (role IN ('profesor', 'estudiante')),
  status        VARCHAR(20)  NOT NULL DEFAULT 'activo'
                  CHECK (status IN ('activo', 'inactivo', 'suspendido', 'en_riesgo')),
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  users IS 'Usuarios del sistema: profesores y estudiantes.';
COMMENT ON COLUMN users.role          IS 'Rol del usuario: profesor | estudiante';
COMMENT ON COLUMN users.status        IS 'Estado de la cuenta: activo | inactivo | suspendido | en_riesgo';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt. Nunca texto plano.';

SELECT create_updated_at_trigger('users');
CREATE INDEX idx_users_email  ON users(email);
CREATE INDEX idx_users_role   ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- =============================================================================
-- 2. CURSOS
-- NOTA: Las tablas app_routes y role_route_permissions fueron eliminadas.
-- El control de acceso a rutas se maneja en el frontend mediante:
--   - src/middleware.ts     (autenticación + aislamiento de roles, O(1))
--   - src/core/config/paths.ts (mapa centralizado de rutas tipado)
-- =============================================================================
CREATE TABLE courses (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id      UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  title           VARCHAR(200) NOT NULL,
  subtitle        VARCHAR(300),
  code            VARCHAR(60)  NOT NULL UNIQUE,
  modality        VARCHAR(20)  NOT NULL DEFAULT 'remoto'
                    CHECK (modality IN ('remoto', 'presencial', 'hibrido')),
  level           VARCHAR(30),
  status          VARCHAR(20)  NOT NULL DEFAULT 'abierto'
                    CHECK (status IN ('abierto', 'cerrado', 'archivado')),
  banner_gradient VARCHAR(100),
  period          VARCHAR(50),
  max_students    INTEGER,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  courses IS 'Cursos dictados por profesores en la plataforma.';
COMMENT ON COLUMN courses.code   IS 'Código único del curso, ej: IDIO.7122.226735.1350.R';
COMMENT ON COLUMN courses.status IS 'abierto | cerrado | archivado';

SELECT create_updated_at_trigger('courses');
CREATE INDEX idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX idx_courses_status     ON courses(status);
CREATE INDEX idx_courses_code       ON courses(code);

-- =============================================================================
-- 5. MATRÍCULAS (Estudiante ↔ Curso)
-- =============================================================================
CREATE TABLE course_enrollments (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   UUID         NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  status      VARCHAR(20)  NOT NULL DEFAULT 'activo'
                CHECK (status IN ('activo', 'retirado', 'completado')),
  progress    NUMERIC(5,2) NOT NULL DEFAULT 0
                CHECK (progress >= 0 AND progress <= 100),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_enrollment UNIQUE (student_id, course_id)
);

COMMENT ON TABLE  course_enrollments IS 'Matrícula N:M de estudiantes en cursos con estado y progreso.';
COMMENT ON COLUMN course_enrollments.progress IS 'Porcentaje de avance 0-100.';

SELECT create_updated_at_trigger('course_enrollments');
CREATE INDEX idx_enrollments_student_id ON course_enrollments(student_id);
CREATE INDEX idx_enrollments_course_id  ON course_enrollments(course_id);

-- =============================================================================
-- 6. SEMANAS DE CONTENIDO
-- =============================================================================
CREATE TABLE course_weeks (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID         NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  week_number INTEGER      NOT NULL CHECK (week_number >= 1),
  title       VARCHAR(200) NOT NULL,
  is_expanded BOOLEAN      NOT NULL DEFAULT FALSE,
  sort_order  INTEGER      NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_week_per_course UNIQUE (course_id, week_number)
);

COMMENT ON TABLE course_weeks IS 'Secciones semanales del contenido de cada curso.';

SELECT create_updated_at_trigger('course_weeks');
CREATE INDEX idx_weeks_course_id ON course_weeks(course_id);

-- =============================================================================
-- 7. BIBLIOTECA DE RECURSOS
-- =============================================================================
-- Se define ANTES de course_content_items por la FK que items tiene hacia library.
-- =============================================================================
CREATE TABLE library_resources (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(300) NOT NULL,
  description     TEXT,
  type            VARCHAR(20)  NOT NULL
                    CHECK (type IN ('documento', 'video', 'presentacion', 'audio', 'enlace')),
  course_tag      VARCHAR(100),
  file_url        TEXT,
  file_size_bytes BIGINT,
  mime_type       VARCHAR(100),
  is_published    BOOLEAN      NOT NULL DEFAULT FALSE,
  usage_count     INTEGER      NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  library_resources IS 'Biblioteca centralizada de recursos del profesor.';
COMMENT ON COLUMN library_resources.file_url    IS 'URL en Supabase Storage o enlace externo.';
COMMENT ON COLUMN library_resources.usage_count IS 'Número de ítems de contenido que usan este recurso.';

SELECT create_updated_at_trigger('library_resources');
CREATE INDEX idx_library_owner_id ON library_resources(owner_id);
CREATE INDEX idx_library_type     ON library_resources(type);

-- =============================================================================
-- 8. ÍTEMS DE CONTENIDO
-- =============================================================================
CREATE TABLE course_content_items (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id             UUID         NOT NULL REFERENCES course_weeks(id) ON DELETE CASCADE,
  title               VARCHAR(300) NOT NULL,
  type                VARCHAR(20)  NOT NULL
                        CHECK (type IN ('video', 'archivo', 'tarea', 'quiz', 'evaluacion', 'enlace')),
  kind                VARCHAR(20)  NOT NULL
                        CHECK (kind IN ('material', 'actividad')),
  meta                VARCHAR(200),
  url                 TEXT,
  library_resource_id UUID         REFERENCES library_resources(id) ON DELETE SET NULL,
  is_published        BOOLEAN      NOT NULL DEFAULT FALSE,
  is_visible          BOOLEAN      NOT NULL DEFAULT FALSE,
  due_date            DATE,
  max_score           NUMERIC(6,2),
  sort_order          INTEGER      NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  course_content_items IS 'Ítems dentro de una semana: materiales y actividades evaluables.';
COMMENT ON COLUMN course_content_items.kind         IS 'material = recurso | actividad = entregable evaluable';
COMMENT ON COLUMN course_content_items.is_published IS 'TRUE = visible para estudiantes.';
COMMENT ON COLUMN course_content_items.is_visible   IS 'TRUE = mostrado en el portal (el docente puede ocultar).';

SELECT create_updated_at_trigger('course_content_items');
CREATE INDEX idx_items_week_id  ON course_content_items(week_id);
CREATE INDEX idx_items_type     ON course_content_items(type);
CREATE INDEX idx_items_kind     ON course_content_items(kind);

-- =============================================================================
-- 9. ENTREGAS (Submissions)
-- =============================================================================
CREATE TABLE submissions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id      UUID        NOT NULL REFERENCES course_content_items(id) ON DELETE CASCADE,
  student_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url     TEXT,
  text_content TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_late      BOOLEAN     NOT NULL DEFAULT FALSE,
  status       VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                 CHECK (status IN ('pendiente', 'calificado', 'vencido')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_submission UNIQUE (item_id, student_id)
);

COMMENT ON TABLE  submissions IS 'Entregas de estudiantes para tareas, quizzes y evaluaciones.';
COMMENT ON COLUMN submissions.is_late IS 'TRUE = entrega después del due_date del ítem.';

SELECT create_updated_at_trigger('submissions');
CREATE INDEX idx_submissions_item_id    ON submissions(item_id);
CREATE INDEX idx_submissions_student_id ON submissions(student_id);
CREATE INDEX idx_submissions_status     ON submissions(status);

-- =============================================================================
-- 10. CALIFICACIONES
-- =============================================================================
CREATE TABLE grades (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID         NOT NULL REFERENCES submissions(id) ON DELETE CASCADE UNIQUE,
  grader_id     UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  score         NUMERIC(6,2) NOT NULL CHECK (score >= 0),
  feedback      TEXT,
  graded_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  grades IS 'Calificaciones asignadas por el profesor a cada entrega.';
COMMENT ON COLUMN grades.score    IS 'Puntuación. La capa de negocio valida que no exceda max_score.';
COMMENT ON COLUMN grades.feedback IS 'Retroalimentación del profesor al estudiante.';

SELECT create_updated_at_trigger('grades');
CREATE INDEX idx_grades_submission_id ON grades(submission_id);
CREATE INDEX idx_grades_grader_id     ON grades(grader_id);

-- =============================================================================
-- 11. CLASES SINCRÓNICAS
-- =============================================================================
CREATE TABLE classes (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID         NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id   UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  title        VARCHAR(300) NOT NULL,
  scheduled_at TIMESTAMPTZ  NOT NULL,
  duration_min INTEGER      NOT NULL DEFAULT 60 CHECK (duration_min > 0),
  platform     VARCHAR(20)  NOT NULL DEFAULT 'teams'
                 CHECK (platform IN ('teams', 'zoom', 'meet', 'otro')),
  meeting_url  TEXT,
  notes        TEXT,
  status       VARCHAR(20)  NOT NULL DEFAULT 'programada'
                 CHECK (status IN ('programada', 'en_curso', 'finalizada', 'cancelada')),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  classes IS 'Sesiones sincrónicas programadas por el profesor.';
COMMENT ON COLUMN classes.duration_min IS 'Duración en minutos.';
COMMENT ON COLUMN classes.platform     IS 'teams | zoom | meet | otro';

SELECT create_updated_at_trigger('classes');
CREATE INDEX idx_classes_course_id    ON classes(course_id);
CREATE INDEX idx_classes_teacher_id   ON classes(teacher_id);
CREATE INDEX idx_classes_scheduled_at ON classes(scheduled_at);

-- =============================================================================
-- 12. ANUNCIOS
-- =============================================================================
CREATE TABLE announcements (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID         NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  author_id    UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  title        VARCHAR(300) NOT NULL,
  content      TEXT         NOT NULL,
  is_pinned    BOOLEAN      NOT NULL DEFAULT FALSE,
  is_published BOOLEAN      NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  announcements IS 'Anuncios publicados por el profesor en cada curso.';
COMMENT ON COLUMN announcements.is_pinned IS 'TRUE = anuncio fijado al tope del listado.';

SELECT create_updated_at_trigger('announcements');
CREATE INDEX idx_announcements_course_id ON announcements(course_id);

-- =============================================================================
-- 13. PAGOS
-- =============================================================================
CREATE TABLE payments (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  course_id      UUID          REFERENCES courses(id) ON DELETE SET NULL,
  concept        VARCHAR(300)  NOT NULL,
  amount         NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency       CHAR(3)       NOT NULL DEFAULT 'USD',
  issue_date     DATE          NOT NULL DEFAULT CURRENT_DATE,
  due_date       DATE          NOT NULL,
  paid_at        TIMESTAMPTZ,
  status         VARCHAR(20)   NOT NULL DEFAULT 'pendiente'
                   CHECK (status IN ('pendiente', 'pagado', 'vencido', 'procesando')),
  payment_method VARCHAR(100),
  reference      VARCHAR(100),
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  payments IS 'Pagos de estudiantes. Ingresados manualmente por el profesor.';
COMMENT ON COLUMN payments.status    IS 'pendiente | pagado | vencido | procesando';
COMMENT ON COLUMN payments.reference IS 'Número de referencia de la transacción, ej: REF-84721';

SELECT create_updated_at_trigger('payments');
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_status     ON payments(status);
CREATE INDEX idx_payments_due_date   ON payments(due_date);

-- =============================================================================
-- 14. EVENTOS DE CALENDARIO
-- =============================================================================
CREATE TABLE calendar_events (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       UUID         REFERENCES courses(id) ON DELETE CASCADE,
  creator_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(300) NOT NULL,
  description     TEXT,
  event_type      VARCHAR(30)  NOT NULL DEFAULT 'general'
                    CHECK (event_type IN ('clase', 'tarea', 'quiz', 'evaluacion', 'pago', 'anuncio', 'general')),
  starts_at       TIMESTAMPTZ  NOT NULL,
  ends_at         TIMESTAMPTZ,
  all_day         BOOLEAN      NOT NULL DEFAULT FALSE,
  color           VARCHAR(20),
  related_item_id UUID,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  calendar_events IS 'Eventos del calendario: clases, vencimientos, pagos, evaluaciones.';
COMMENT ON COLUMN calendar_events.course_id       IS 'NULL = evento personal | NOT NULL = evento del curso';
COMMENT ON COLUMN calendar_events.related_item_id IS 'ID polimórfico del recurso relacionado (sin FK para flexibilidad).';

SELECT create_updated_at_trigger('calendar_events');
CREATE INDEX idx_calendar_course_id  ON calendar_events(course_id);
CREATE INDEX idx_calendar_creator_id ON calendar_events(creator_id);
CREATE INDEX idx_calendar_starts_at  ON calendar_events(starts_at);

-- =============================================================================
-- FIN DEL ESQUEMA — Kelly Academy v1.1
-- Tablas: users, courses, course_enrollments, course_weeks,
--         library_resources, course_content_items, submissions,
--         grades, classes, announcements, payments,
--         calendar_events, levels (13 tablas)
--
-- ELIMINADO: app_routes, role_route_permissions
-- El control de acceso ahora es responsabilidad del frontend:
--   middleware.ts (cookie-based) + paths.ts (rutas tipadas)
-- =============================================================================
