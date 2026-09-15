import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from './dto/announcement.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Announcements')
@ApiBearerAuth()
@Controller('courses/:courseId/announcements')
export class AnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60_000) // 60 s — anuncios cambian con poca frecuencia
  @ApiOperation({ summary: 'Anuncios del curso' })
  findByCourse(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findByCourse(courseId, user.role === 'profesor');
  }
  @Post()
  @Roles('profesor')
  @ApiOperation({ summary: 'Crear anuncio' })
  create(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() dto: CreateAnnouncementDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.create(courseId, dto, user.sub);
  }
  @Patch(':annId')
  @Roles('profesor')
  @ApiOperation({ summary: 'Actualizar anuncio' })
  update(
    @Param('annId', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':annId')
  @Roles('profesor')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar anuncio' })
  remove(@Param('annId', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
