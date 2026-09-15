import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LevelsService } from './levels.service';

@ApiTags('Levels')
@ApiBearerAuth()
@Controller('levels')
export class LevelsController {
  constructor(private readonly service: LevelsService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300_000) // 5 min — los niveles cambian muy poco
  @ApiOperation({ summary: 'Listar niveles de cursos disponibles' })
  findAll() {
    return this.service.findAll();
  }
}
