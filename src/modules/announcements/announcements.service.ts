import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './entities/announcement.entity';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from './dto/announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly repo: Repository<Announcement>,
  ) {}
  async findByCourse(courseId: string, isTeacher: boolean) {
    const qb = this.repo
      .createQueryBuilder('a')
      .where('a.courseId = :courseId', { courseId })
      .leftJoinAndSelect('a.author', 'author')
      .orderBy('a.isPinned', 'DESC')
      .addOrderBy('a.publishedAt', 'DESC');
    if (!isTeacher) qb.andWhere('a.isPublished = TRUE');
    return qb.getMany();
  }
  async create(
    courseId: string,
    dto: CreateAnnouncementDto,
    authorId: string,
  ): Promise<Announcement> {
    return this.repo.save({ ...dto, courseId, authorId });
  }
  async update(id: string, dto: UpdateAnnouncementDto): Promise<Announcement> {
    const a = await this.repo.findOne({ where: { id } });
    if (!a) throw new NotFoundException(`Anuncio ${id} no encontrado`);
    return this.repo.save({ ...a, ...dto });
  }
  async remove(id: string): Promise<void> {
    const a = await this.repo.findOne({ where: { id } });
    if (!a) throw new NotFoundException(`Anuncio ${id} no encontrado`);
    await this.repo.delete(id);
  }
}
