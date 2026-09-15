import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseWeek } from './entities/course-week.entity';
import { CourseContentItem } from './entities/course-content-item.entity';
import {
  CreateWeekDto,
  UpdateWeekDto,
  CreateContentItemDto,
  UpdateContentItemDto,
  PublishItemDto,
  VisibilityItemDto,
} from './dto/content.dto';

export interface WeekWithItems extends CourseWeek {
  items: CourseContentItem[];
}

/**
 * content.service.ts — Gestión de semanas e ítems de contenido.
 * SRP: única responsabilidad sobre el contenido del curso.
 */
@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(CourseWeek)
    private readonly weekRepository: Repository<CourseWeek>,
    @InjectRepository(CourseContentItem)
    private readonly itemRepository: Repository<CourseContentItem>,
  ) {}

  // ── Weeks ─────────────────────────────────────────────────────────

  async findWeeks(courseId: string) {
    return this.weekRepository.find({
      where: { courseId },
      order: { weekNumber: 'ASC' },
    });
  }

  /**
   * findWeeksFull — Returns all weeks for a course with items included.
   * Single DB query via LEFT JOIN, eliminating N+1 pattern from the frontend.
   * Profesor sees all items; students only published+visible ones.
   */
  async findWeeksFull(
    courseId: string,
    isTeacher: boolean,
  ): Promise<WeekWithItems[]> {
    const weeks = await this.weekRepository.find({
      where: { courseId },
      order: { weekNumber: 'ASC' },
    });

    if (weeks.length === 0) return [];

    const weekIds = weeks.map((w) => w.id);
    const qb = this.itemRepository
      .createQueryBuilder('i')
      .where('i.weekId IN (:...weekIds)', { weekIds })
      .orderBy('i.sortOrder', 'ASC');

    if (!isTeacher) {
      qb.andWhere('i.isPublished = TRUE').andWhere('i.isVisible = TRUE');
    }

    const allItems = await qb.getMany();

    // Group items by weekId
    const itemsByWeek = new Map<string, CourseContentItem[]>();
    for (const item of allItems) {
      const list = itemsByWeek.get(item.weekId) ?? [];
      list.push(item);
      itemsByWeek.set(item.weekId, list);
    }

    return weeks.map((w) => ({
      ...w,
      items: itemsByWeek.get(w.id) ?? [],
    }));
  }

  async createWeek(courseId: string, dto: CreateWeekDto): Promise<CourseWeek> {
    const existing = await this.weekRepository.findOne({
      where: { courseId, weekNumber: dto.weekNumber },
    });
    if (existing)
      throw new ConflictException(
        `La semana ${dto.weekNumber} ya existe en este curso`,
      );
    return this.weekRepository.save({ ...dto, courseId });
  }

  async updateWeek(weekId: string, dto: UpdateWeekDto): Promise<CourseWeek> {
    const week = await this.findWeekOrFail(weekId);
    return this.weekRepository.save({ ...week, ...dto });
  }

  async removeWeek(weekId: string): Promise<void> {
    await this.findWeekOrFail(weekId);
    await this.weekRepository.delete(weekId);
  }

  // ── Items ─────────────────────────────────────────────────────────

  async findItems(weekId: string, isTeacher: boolean) {
    const qb = this.itemRepository
      .createQueryBuilder('i')
      .where('i.weekId = :weekId', { weekId })
      .orderBy('i.sortOrder', 'ASC');

    if (!isTeacher) {
      qb.andWhere('i.isPublished = TRUE').andWhere('i.isVisible = TRUE');
    }

    return qb.getMany();
  }

  async createItem(
    weekId: string,
    dto: CreateContentItemDto,
  ): Promise<CourseContentItem> {
    // Derivar `kind` automáticamente si el cliente no lo envía
    const ACTIVITY_TYPES = ['tarea', 'quiz', 'evaluacion'];
    const kind = dto.kind ?? (ACTIVITY_TYPES.includes(dto.type) ? 'actividad' : 'material');
    return this.itemRepository.save({ ...dto, kind, weekId });
  }

  async updateItem(
    itemId: string,
    dto: UpdateContentItemDto,
  ): Promise<CourseContentItem> {
    const item = await this.findItemOrFail(itemId);
    return this.itemRepository.save({ ...item, ...dto });
  }

  async removeItem(itemId: string): Promise<void> {
    await this.findItemOrFail(itemId);
    await this.itemRepository.delete(itemId);
  }

  async setPublished(
    itemId: string,
    dto: PublishItemDto,
  ): Promise<CourseContentItem> {
    const item = await this.findItemOrFail(itemId);
    return this.itemRepository.save({ ...item, isPublished: dto.isPublished });
  }

  async setVisibility(
    itemId: string,
    dto: VisibilityItemDto,
  ): Promise<CourseContentItem> {
    const item = await this.findItemOrFail(itemId);
    return this.itemRepository.save({ ...item, isVisible: dto.isVisible });
  }

  // ── Helpers ───────────────────────────────────────────────────────

  private async findWeekOrFail(weekId: string): Promise<CourseWeek> {
    const week = await this.weekRepository.findOne({ where: { id: weekId } });
    if (!week) throw new NotFoundException(`Semana ${weekId} no encontrada`);
    return week;
  }

  private async findItemOrFail(itemId: string): Promise<CourseContentItem> {
    const item = await this.itemRepository.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException(`Ítem ${itemId} no encontrado`);
    return item;
  }
}
