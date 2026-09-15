import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Level } from './entities/level.entity';

@Injectable()
export class LevelsService {
  constructor(
    @InjectRepository(Level)
    private readonly levelRepo: Repository<Level>,
  ) {}

  async findAll(): Promise<Level[]> {
    return this.levelRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }
}
