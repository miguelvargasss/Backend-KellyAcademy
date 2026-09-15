import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CourseEnrollment } from './entities/course-enrollment.entity';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(CourseEnrollment)
    private readonly enrollmentRepository: Repository<CourseEnrollment>,
  ) {}

  async findAll(pagination: PaginationDto, user: JwtPayload) {
    const qb = this.courseRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.teacher', 'teacher')
      .orderBy('c.createdAt', 'DESC')
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit);

    if (user.role === 'profesor') {
      qb.where('c.teacherId = :teacherId', { teacherId: user.sub });
    }

    const [courses, total] = await qb.getManyAndCount();
    return {
      courses,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        pages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async findMyCourses(studentId: string) {
    return this.enrollmentRepository.find({
      where: { studentId, status: 'activo' },
      relations: ['course', 'course.teacher'],
    });
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['teacher'],
    });
    if (!course) throw new NotFoundException(`Curso ${id} no encontrado`);
    return course;
  }

  async create(dto: CreateCourseDto, teacherId: string): Promise<Course> {
    const existing = await this.courseRepository.findOne({
      where: { code: dto.code },
    });
    if (existing)
      throw new ConflictException(
        `Ya existe un curso con el código ${dto.code}`,
      );
    const course = this.courseRepository.create({ ...dto, teacherId });
    return this.courseRepository.save(course);
  }

  async update(
    id: string,
    dto: UpdateCourseDto,
    user: JwtPayload,
  ): Promise<Course> {
    const course = await this.findOne(id);
    if (user.role === 'profesor' && course.teacherId !== user.sub) {
      throw new ForbiddenException('Solo puedes editar tus propios cursos');
    }
    const updated = await this.courseRepository.save({ ...course, ...dto });
    return updated;
  }

  async remove(id: string, user: JwtPayload): Promise<void> {
    const course = await this.findOne(id);
    if (user.role === 'profesor' && course.teacherId !== user.sub) {
      throw new ForbiddenException('Solo puedes eliminar tus propios cursos');
    }
    await this.courseRepository.delete(id);
  }

  async getStudents(courseId: string) {
    return this.enrollmentRepository.find({
      where: { courseId },
      relations: ['student'],
    });
  }

  async getStats(courseId: string) {
    const enrollments = await this.enrollmentRepository.find({
      where: { courseId },
    });
    const avgProgress = enrollments.length
      ? enrollments.reduce((s, e) => s + Number(e.progress), 0) /
        enrollments.length
      : 0;
    return {
      studentCount: enrollments.length,
      activeStudents: enrollments.filter((e) => e.status === 'activo').length,
      averageProgress: Math.round(avgProgress),
    };
  }
}
