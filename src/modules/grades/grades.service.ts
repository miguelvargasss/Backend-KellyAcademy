import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { CreateGradeDto, UpdateGradeDto } from './dto/grade.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade) private readonly gradeRepo: Repository<Grade>,
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,
  ) {}

  async findAll(pagination: PaginationDto, courseId?: string) {
    const qb = this.gradeRepo
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.submission', 's')
      .leftJoinAndSelect('s.student', 'student')
      .leftJoinAndSelect('s.item', 'item')
      .leftJoinAndSelect('item.week', 'week')
      .orderBy('g.gradedAt', 'DESC')
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit);
    if (courseId) qb.where('week.courseId = :courseId', { courseId });
    const [grades, total] = await qb.getManyAndCount();
    return {
      grades,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        pages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async findMy(studentId: string) {
    return this.gradeRepo
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.submission', 's')
      .leftJoinAndSelect('s.item', 'item')
      .where('s.studentId = :studentId', { studentId })
      .orderBy('g.gradedAt', 'DESC')
      .getMany();
  }

  async create(dto: CreateGradeDto, graderId: string): Promise<Grade> {
    const submission = await this.submissionRepo.findOne({
      where: { id: dto.submissionId },
    });
    if (!submission) throw new NotFoundException('Entrega no encontrada');
    const existing = await this.gradeRepo.findOne({
      where: { submissionId: dto.submissionId },
    });
    if (existing)
      throw new ConflictException(
        'Esta entrega ya fue calificada. Use PATCH /grades/:id',
      );
    const grade = await this.gradeRepo.save({ ...dto, graderId });
    await this.submissionRepo.update(dto.submissionId, {
      status: 'calificado',
    });
    return grade;
  }

  async update(id: string, dto: UpdateGradeDto): Promise<Grade> {
    const grade = await this.gradeRepo.findOne({ where: { id } });
    if (!grade) throw new NotFoundException(`Calificación ${id} no encontrada`);
    return this.gradeRepo.save({ ...grade, ...dto });
  }

  /**
   * Retorna todas las actividades (kind='actividad') del curso,
   * agrupadas por semana, con conteos de entregas y calificaciones.
   * Usado por el Libro de Calificaciones del profesor.
   */
  async findActivitiesByCourse(courseId: string) {
    const items = await this.gradeRepo.manager
      .createQueryBuilder()
      .select([
        'i.id as "id"',
        'i.title as "title"',
        'i.meta as "description"',
        'i.url as "fileUrl"',
        'i.type as "type"',
        'i.due_date as "dueDate"',
        'i.max_score as "maxScore"',
        'i.is_visible as "isVisible"',
        'w.id as "weekId"',
        'w.title as "weekTitle"',
        'w.week_number as "weekNumber"',
        'COUNT(DISTINCT s.id) as "submissionsCount"',
        'COUNT(DISTINCT g.id) as "gradedCount"',
      ])
      .from('course_content_items', 'i')
      .innerJoin('course_weeks', 'w', 'w.id = i.week_id')
      .leftJoin('submissions', 's', 's.item_id = i.id')
      .leftJoin('grades', 'g', 'g.submission_id = s.id')
      .where('w.course_id = :courseId', { courseId })
      .andWhere("i.kind = 'actividad'")
      .groupBy('i.id, w.id')
      .orderBy('w.week_number', 'ASC')
      .addOrderBy('i.sort_order', 'ASC')
      .getRawMany();

    // Agrupar por semana
    const weekMap = new Map<string, any>();
    for (const item of items) {
      if (!weekMap.has(item.weekId)) {
        weekMap.set(item.weekId, {
          weekId: item.weekId,
          weekTitle: item.weekTitle,
          weekNumber: item.weekNumber,
          activities: [],
        });
      }
      weekMap.get(item.weekId).activities.push({
        id: item.id,
        title: item.title,
        type: item.type,
        dueDate: item.dueDate,
        maxScore: item.maxScore ? Number(item.maxScore) : 100,
        isVisible: item.isVisible,
        submissionsCount: Number(item.submissionsCount),
        gradedCount: Number(item.gradedCount),
      });
    }
    return Array.from(weekMap.values());
  }
}
