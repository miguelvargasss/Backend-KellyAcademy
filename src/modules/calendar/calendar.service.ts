import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalendarEvent } from './entities/calendar-event.entity';
import {
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
} from './dto/calendar.dto';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarEvent)
    private readonly repo: Repository<CalendarEvent>,
  ) {}
  async findAll(creatorId: string, courseId?: string) {
    const qb = this.repo
      .createQueryBuilder('e')
      .where('e.creatorId = :creatorId', { creatorId })
      .orderBy('e.startsAt', 'ASC');
    if (courseId) qb.orWhere('e.courseId = :courseId', { courseId });
    return qb.getMany();
  }
  async findByCourse(courseId: string) {
    return this.repo.find({ where: { courseId }, order: { startsAt: 'ASC' } });
  }
  async create(
    dto: CreateCalendarEventDto,
    creatorId: string,
  ): Promise<CalendarEvent> {
    return this.repo.save({ ...dto, creatorId });
  }
  async update(
    id: string,
    dto: UpdateCalendarEventDto,
  ): Promise<CalendarEvent> {
    const e = await this.repo.findOne({ where: { id } });
    if (!e) throw new NotFoundException(`Evento ${id} no encontrado`);
    return this.repo.save({ ...e, ...dto });
  }
  async remove(id: string): Promise<void> {
    const e = await this.repo.findOne({ where: { id } });
    if (!e) throw new NotFoundException(`Evento ${id} no encontrado`);
    await this.repo.delete(id);
  }
}
