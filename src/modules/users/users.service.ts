import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserStatusDto,
  AssignCourseDto,
} from './dto/user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CourseEnrollment } from '../courses/entities/course-enrollment.entity';

/**
 * users.service.ts — Lógica de negocio para gestión de usuarios.
 * ───────────────────────────────────────────────────────────────
 * SRP: único responsable de las operaciones sobre usuarios.
 * DIP: depende del repositorio inyectado, no de la implementación concreta.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CourseEnrollment)
    private readonly enrollmentRepository: Repository<CourseEnrollment>,
  ) {}

  async findAll(pagination: PaginationDto, role?: string, status?: string) {
    const qb = this.userRepository
      .createQueryBuilder('u')
      .orderBy('u.createdAt', 'DESC')
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit);

    if (role) qb.andWhere('u.role = :role', { role });
    if (status) qb.andWhere('u.status = :status', { status });

    const [users, total] = await qb.getManyAndCount();
    return {
      users: users.map((u) => this.sanitize(u)),
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        pages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async findOne(id: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return this.sanitize(user);
  }

  async create(dto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const exists = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (exists)
      throw new ConflictException('Ya existe un usuario con ese email');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepository.create({
      ...dto,
      passwordHash,
    });
    const saved = await this.userRepository.save(user);
    return this.sanitize(saved);
  }

  async update(
    id: string,
    dto: UpdateUserDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.findOneRaw(id);
    const updateData: Record<string, unknown> = { ...dto };
    if ((dto as { password?: string }).password) {
      updateData['passwordHash'] = await bcrypt.hash(
        (dto as { password: string }).password,
        12,
      );
      delete updateData['password'];
    }
    const updated = await this.userRepository.save({ ...user, ...updateData });
    return this.sanitize(updated);
  }

  async updateStatus(
    id: string,
    dto: UpdateUserStatusDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    await this.findOneRaw(id);
    await this.userRepository.update(id, { status: dto.status });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOneRaw(id);
    await this.userRepository.delete(id);
  }

  async findCourses(studentId: string) {
    return this.enrollmentRepository.find({
      where: { studentId },
      relations: ['course'],
    });
  }

  async assignCourse(studentId: string, dto: AssignCourseDto) {
    await this.findOneRaw(studentId);
    const existing = await this.enrollmentRepository.findOne({
      where: { studentId, courseId: dto.courseId },
    });
    if (existing)
      throw new ConflictException('El alumno ya está inscrito en ese curso');
    return this.enrollmentRepository.save({
      studentId,
      courseId: dto.courseId,
    });
  }

  async removeCourse(studentId: string, courseId: string): Promise<void> {
    await this.enrollmentRepository.delete({ studentId, courseId });
  }

  // ── Helpers privados ─────────────────────────────────────────────

  private async findOneRaw(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return user;
  }

  private sanitize(user: User): Omit<User, 'passwordHash'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safe } = user;
    return safe;
  }
}
