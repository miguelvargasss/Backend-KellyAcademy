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
import { ContentService } from './content.service';
import {
  CreateWeekDto,
  UpdateWeekDto,
  CreateContentItemDto,
  UpdateContentItemDto,
  PublishItemDto,
  VisibilityItemDto,
} from './dto/content.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Content')
@ApiBearerAuth()
@Controller('courses/:courseId')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // ── Weeks ──────────────────────────────────────────────────────────────
  @Get('weeks')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(120_000) // 2 min — las semanas son casi estáticas
  @ApiOperation({ summary: 'Listar semanas del curso' })
  findWeeks(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.contentService.findWeeks(courseId);
  }

  @Get('weeks/full')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60_000) // 60 s — semanas + ítems en una sola query (resuelve N+1)
  @ApiOperation({ summary: 'Listar semanas con sus ítems incluidos (optimizado, sin N+1)' })
  findWeeksFull(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contentService.findWeeksFull(courseId, user.role === 'profesor');
  }

  @Post('weeks')
  @Roles('profesor')
  @ApiOperation({ summary: 'Crear nueva semana en el curso' })
  createWeek(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() dto: CreateWeekDto,
  ) {
    return this.contentService.createWeek(courseId, dto);
  }

  @Patch('weeks/:weekId')
  @Roles('profesor')
  @ApiOperation({ summary: 'Actualizar semana' })
  updateWeek(
    @Param('weekId', ParseUUIDPipe) weekId: string,
    @Body() dto: UpdateWeekDto,
  ) {
    return this.contentService.updateWeek(weekId, dto);
  }

  @Delete('weeks/:weekId')
  @Roles('profesor')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar semana y su contenido' })
  removeWeek(@Param('weekId', ParseUUIDPipe) weekId: string) {
    return this.contentService.removeWeek(weekId);
  }

  // ── Items ───────────────────────────────────────────────────────────────
  @Get('weeks/:weekId/items')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60_000) // 60 s
  @ApiOperation({ summary: 'Listar ítems de una semana' })
  findItems(
    @Param('weekId', ParseUUIDPipe) weekId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contentService.findItems(weekId, user.role === 'profesor');
  }

  @Post('weeks/:weekId/items')
  @Roles('profesor')
  @ApiOperation({ summary: 'Crear ítem de contenido en una semana' })
  createItem(
    @Param('weekId', ParseUUIDPipe) weekId: string,
    @Body() dto: CreateContentItemDto,
  ) {
    return this.contentService.createItem(weekId, dto);
  }

  @Patch('weeks/:weekId/items/:itemId')
  @Roles('profesor')
  @ApiOperation({ summary: 'Actualizar ítem de contenido' })
  updateItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateContentItemDto,
  ) {
    return this.contentService.updateItem(itemId, dto);
  }

  @Delete('weeks/:weekId/items/:itemId')
  @Roles('profesor')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar ítem de contenido' })
  removeItem(@Param('itemId', ParseUUIDPipe) itemId: string) {
    return this.contentService.removeItem(itemId);
  }

  @Patch('weeks/:weekId/items/:itemId/publish')
  @Roles('profesor')
  @ApiOperation({ summary: 'Publicar o despublicar un ítem' })
  setPublished(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: PublishItemDto,
  ) {
    return this.contentService.setPublished(itemId, dto);
  }

  @Patch('weeks/:weekId/items/:itemId/visibility')
  @Roles('profesor')
  @ApiOperation({ summary: 'Mostrar u ocultar un ítem para los alumnos' })
  setVisibility(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: VisibilityItemDto,
  ) {
    return this.contentService.setVisibility(itemId, dto);
  }
}
