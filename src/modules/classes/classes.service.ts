import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassSession } from './entities/class-session.entity';
import { CreateClassDto, UpdateClassDto } from './dto/class.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(ClassSession)
    private readonly repo: Repository<ClassSession>,
  ) {}
  async findAll(pagination: PaginationDto) {
    const [classes, total] = await this.repo.findAndCount({
      relations: ['course', 'teacher'],
      order: { scheduledAt: 'ASC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
    return {
      classes,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        pages: Math.ceil(total / pagination.limit),
      },
    };
  }
  async findByCourse(courseId: string) {
    return this.repo.find({
      where: { courseId },
      relations: ['teacher'],
      order: { scheduledAt: 'ASC' },
    });
  }
  async findOne(id: string): Promise<ClassSession> {
    const c = await this.repo.findOne({
      where: { id },
      relations: ['course', 'teacher'],
    });
    if (!c) throw new NotFoundException(`Clase ${id} no encontrada`);
    return c;
  }
  async create(dto: CreateClassDto, teacherId: string): Promise<ClassSession> {
    return this.repo.save({ ...dto, teacherId });
  }
  async update(id: string, dto: UpdateClassDto): Promise<ClassSession> {
    const c = await this.findOne(id);
    return this.repo.save({ ...c, ...dto });
  }
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
