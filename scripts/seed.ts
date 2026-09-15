import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../src/modules/users/entities/user.entity';
import { Course } from '../src/modules/courses/entities/course.entity';
import { CourseEnrollment } from '../src/modules/courses/entities/course-enrollment.entity';
import { CourseWeek } from '../src/modules/content/entities/course-week.entity';
import { CourseContentItem } from '../src/modules/content/entities/course-content-item.entity';
import { AppRoute } from '../src/modules/permissions/entities/app-route.entity';
import { RoleRoutePermission } from '../src/modules/permissions/entities/role-route-permission.entity';
import { Level } from '../src/modules/levels/entities/level.entity';

async function bootstrap() {
  console.log('Iniciando seed de base de datos...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const userRepository = dataSource.getRepository(User);
  const courseRepository = dataSource.getRepository(Course);
  const enrollmentRepository = dataSource.getRepository(CourseEnrollment);
  const weekRepository = dataSource.getRepository(CourseWeek);
  const contentRepository = dataSource.getRepository(CourseContentItem);
  const routeRepository = dataSource.getRepository(AppRoute);
  const routePermissionRepository = dataSource.getRepository(RoleRoutePermission);
  const levelRepository = dataSource.getRepository(Level);

  const passwordHash = await bcrypt.hash('123456', 10);

  // ── Niveles ──────────────────────────────────────────────────────
  console.log('Creando niveles de cursos...');
  const levelsData = [
    { code: 'A1', name: 'A1 — Principiante', description: 'Nivel inicial de inglés', sortOrder: 1 },
    { code: 'A2', name: 'A2 — Elemental', description: 'Nivel elemental de inglés', sortOrder: 2 },
    { code: 'B1', name: 'B1 — Intermedio bajo', description: 'Nivel pre-intermedio de inglés', sortOrder: 3 },
    { code: 'B2', name: 'B2 — Intermedio', description: 'Nivel intermedio de inglés', sortOrder: 4 },
    { code: 'C1', name: 'C1 — Avanzado', description: 'Nivel avanzado de inglés', sortOrder: 5 },
    { code: 'C2', name: 'C2 — Dominio', description: 'Nivel de dominio nativo de inglés', sortOrder: 6 },
    { code: 'Business', name: 'Business English', description: 'Inglés para negocios y presentaciones corporativas', sortOrder: 7 },
    { code: 'Conversacion', name: 'Conversación', description: 'Curso enfocado en fluidez oral', sortOrder: 8 },
    { code: 'Biblica', name: 'Inglés Bíblico', description: 'Inglés aplicado a textos bíblicos', sortOrder: 9 },
  ];

  for (const l of levelsData) {
    let level = await levelRepository.findOneBy({ code: l.code });
    if (!level) {
      level = levelRepository.create(l);
      await levelRepository.save(level);
    }
  }

  // ── Usuarios ─────────────────────────────────────────────────────
  console.log('Creando usuario profesor...');
  let professor = await userRepository.findOneBy({ email: 'kellyquispe@kellyacademy.com' });
  if (!professor) {
    professor = userRepository.create({
      fullName: 'Kelly Quispe',
      email: 'kellyquispe@kellyacademy.com',
      passwordHash,
      role: 'profesor',
      status: 'activo',
    });
    await userRepository.save(professor);
  } else {
    professor.passwordHash = passwordHash;
    await userRepository.save(professor);
  }

  console.log('Creando usuario estudiante...');
  let student = await userRepository.findOneBy({ email: 'userprueba@kellyacademy.com' });
  if (!student) {
    student = userRepository.create({
      fullName: 'Usuario de Prueba',
      email: 'userprueba@kellyacademy.com',
      passwordHash,
      role: 'estudiante',
      status: 'activo',
    });
    await userRepository.save(student);
  } else {
    student.passwordHash = passwordHash;
    await userRepository.save(student);
  }

  // ── Curso de prueba ──────────────────────────────────────────────
  console.log('Creando curso de prueba...');
  let course = await courseRepository.findOneBy({ code: 'IDIO.7122.226735.1350.R' });
  if (!course) {
    course = courseRepository.create({
      teacherId: professor.id,
      title: 'Inglés Intermedio B2',
      subtitle: 'High Beginner – Grupo 226735.1350 (Remoto)',
      code: 'IDIO.7122.226735.1350.R',
      modality: 'remoto',
      level: 'B2',
      status: 'abierto',
      bannerGradient: 'from-[#8B1A00] via-[#C0291A] to-[#E8402C]',
    });
    await courseRepository.save(course);
  }

  console.log('Matriculando estudiante en el curso...');
  let enrollment = await enrollmentRepository.findOneBy({ studentId: student.id, courseId: course.id });
  if (!enrollment) {
    enrollment = enrollmentRepository.create({
      studentId: student.id,
      courseId: course.id,
      status: 'activo',
      progress: 62,
    });
    await enrollmentRepository.save(enrollment);
  }

  console.log('Creando contenido semanal...');
  let week1 = await weekRepository.findOneBy({ courseId: course.id, weekNumber: 1 });
  if (!week1) {
    week1 = weekRepository.create({ courseId: course.id, weekNumber: 1, title: 'Introducción y Syllabus' });
    await weekRepository.save(week1);
    await contentRepository.save([
      contentRepository.create({ weekId: week1.id, title: 'Bienvenida al curso', type: 'video', kind: 'material', isPublished: true, isVisible: true, sortOrder: 1 }),
      contentRepository.create({ weekId: week1.id, title: 'Syllabus completo', type: 'archivo', kind: 'material', isPublished: true, isVisible: true, sortOrder: 2 }),
      contentRepository.create({ weekId: week1.id, title: 'Tarea: Self-introduction', type: 'tarea', kind: 'actividad', isPublished: true, isVisible: true, sortOrder: 3 }),
    ]);
  }

  let week2 = await weekRepository.findOneBy({ courseId: course.id, weekNumber: 2 });
  if (!week2) {
    week2 = weekRepository.create({ courseId: course.id, weekNumber: 2, title: 'Week 2 — Past Perfect Tense' });
    await weekRepository.save(week2);
    await contentRepository.save([
      contentRepository.create({ weekId: week2.id, title: 'Explicación: Past Perfect', type: 'video', kind: 'material', isPublished: true, isVisible: true, sortOrder: 1 }),
      contentRepository.create({ weekId: week2.id, title: 'Quiz de Vocabulario Unidad 4', type: 'quiz', kind: 'actividad', isPublished: true, isVisible: true, sortOrder: 2 }),
    ]);
  }

  // ── Rutas y permisos ─────────────────────────────────────────────
  console.log('Creando rutas y permisos...');

  // Desactivar la ruta de calificaciones del profesor si existe
  const calificacionesRoute = await routeRepository.findOneBy({ path: '/profesor/calificaciones' });
  if (calificacionesRoute) {
    calificacionesRoute.isActive = false;
    await routeRepository.save(calificacionesRoute);
    console.log('Ruta /profesor/calificaciones desactivada.');
  }

  const routesData = [
    // Profesor routes (sin calificaciones)
    { path: '/profesor', name: 'Inicio', description: 'Dashboard docente', module: 'profesor', isPublic: false, isActive: true, sortOrder: 1, roles: ['profesor'] },
    { path: '/profesor/cursos', name: 'Mis Cursos', description: 'Gestión de cursos', module: 'profesor', isPublic: false, isActive: true, sortOrder: 2, roles: ['profesor'] },
    { path: '/profesor/alumnos', name: 'Alumnos', description: 'Gestión de alumnos', module: 'profesor', isPublic: false, isActive: true, sortOrder: 3, roles: ['profesor'] },
    { path: '/profesor/biblioteca', name: 'Biblioteca', description: 'Recursos del docente', module: 'profesor', isPublic: false, isActive: true, sortOrder: 4, roles: ['profesor'] },
    // Estudiante routes
    { path: '/estudiante', name: 'Inicio', description: 'Dashboard estudiantil', module: 'estudiante', isPublic: false, isActive: true, sortOrder: 1, roles: ['estudiante'] },
    { path: '/estudiante/cursos', name: 'Mis Cursos', description: 'Cursos del estudiante', module: 'estudiante', isPublic: false, isActive: true, sortOrder: 2, roles: ['estudiante'] },
    { path: '/estudiante/calificaciones', name: 'Calificaciones', description: 'Notas del estudiante', module: 'estudiante', isPublic: false, isActive: true, sortOrder: 3, roles: ['estudiante'] },
    { path: '/estudiante/biblioteca', name: 'Biblioteca Virtual', description: 'Recursos compartidos', module: 'estudiante', isPublic: false, isActive: true, sortOrder: 4, roles: ['estudiante'] },
    { path: '/estudiante/pagos', name: 'Pagos', description: 'Estado de pagos', module: 'estudiante', isPublic: false, isActive: true, sortOrder: 5, roles: ['estudiante'] },
  ];

  for (const r of routesData) {
    let route = await routeRepository.findOneBy({ path: r.path });
    if (!route) {
      route = routeRepository.create({
        path: r.path, name: r.name, description: r.description,
        module: r.module, isPublic: r.isPublic, isActive: r.isActive, sortOrder: r.sortOrder
      });
      await routeRepository.save(route);
    }
    for (const role of r.roles) {
      let perm = await routePermissionRepository.findOneBy({ routeId: route.id, role: role as 'profesor' | 'estudiante' });
      if (!perm) {
        perm = routePermissionRepository.create({ routeId: route.id, role: role as 'profesor' | 'estudiante', canAccess: true });
        await routePermissionRepository.save(perm);
      } else if (!perm.canAccess) {
        perm.canAccess = true;
        await routePermissionRepository.save(perm);
      }
    }
  }

  console.log('Seed completado exitosamente.');
  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('Error durante el seed:', err);
  process.exit(1);
});
