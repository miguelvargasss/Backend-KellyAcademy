import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LibraryResource } from './entities/library-resource.entity';
import {
  CreateLibraryResourceDto,
  UpdateLibraryResourceDto,
  PublishResourceDto,
} from './dto/library.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class LibraryService {
  constructor(
    @InjectRepository(LibraryResource)
    private readonly repo: Repository<LibraryResource>,
  ) {}

  async findAll(pagination: PaginationDto, ownerId: string, type?: string) {
    const qb = this.repo
      .createQueryBuilder('r')
      .where('r.ownerId = :ownerId', { ownerId })
      .orderBy('r.createdAt', 'DESC')
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit);
    if (type) qb.andWhere('r.type = :type', { type });
    const [resources, total] = await qb.getManyAndCount();
    return {
      resources,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        pages: Math.ceil(total / pagination.limit),
      },
    };
  }

  /** Devuelve todos los recursos publicados — accesible por estudiantes */
  async findPublished(pagination: PaginationDto, type?: string) {
    const qb = this.repo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.owner', 'owner')
      .where('r.isPublished = true')
      .orderBy('r.createdAt', 'DESC')
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit);
    if (type) qb.andWhere('r.type = :type', { type });
    const [resources, total] = await qb.getManyAndCount();
    return {
      resources,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        pages: Math.ceil(total / pagination.limit),
      },
    };
  }


  async findOne(id: string): Promise<LibraryResource> {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException(`Recurso ${id} no encontrado`);
    return r;
  }

  async create(
    dto: CreateLibraryResourceDto,
    ownerId: string,
  ): Promise<LibraryResource> {
    return this.repo.save({ ...dto, ownerId });
  }

  async update(
    id: string,
    dto: UpdateLibraryResourceDto,
  ): Promise<LibraryResource> {
    const r = await this.findOne(id);
    return this.repo.save({ ...r, ...dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }

  async setPublished(
    id: string,
    dto: PublishResourceDto,
  ): Promise<LibraryResource> {
    const r = await this.findOne(id);
    return this.repo.save({ ...r, isPublished: dto.isPublished });
  }
}
