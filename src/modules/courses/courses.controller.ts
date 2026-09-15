import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30_000) // 30 s — lista de cursos se refresca frecuente
  @ApiOperation({ summary: 'Listar cursos (el profesor ve solo los suyos)' })
  findAll(@Query() pagination: PaginationDto, @CurrentUser() user: JwtPayload) {
    return this.coursesService.findAll(pagination, user);
  }

  @Get('my')
  @Roles('estudiante')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60_000) // 60 s — mis cursos cambian poco
  @ApiOperation({ summary: 'Cursos del estudiante autenticado' })
  findMyCourses(@CurrentUser() user: JwtPayload) {
    return this.coursesService.findMyCourses(user.sub);
  }

  @Post()
  @Roles('profesor')
  @ApiOperation({ summary: 'Crear nuevo curso' })
  create(@Body() dto: CreateCourseDto, @CurrentUser() user: JwtPayload) {
    return this.coursesService.create(dto, user.sub);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(120_000) // 2 min — detalle de curso es casi estático
  @ApiOperation({ summary: 'Obtener detalle de un curso' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @Roles('profesor')
  @ApiOperation({ summary: 'Actualizar curso' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.coursesService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles('profesor')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar curso' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.coursesService.remove(id, user);
  }

  @Get(':id/students')
  @Roles('profesor')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60_000)
  @ApiOperation({ summary: 'Obtener estudiantes matriculados en el curso' })
  getStudents(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.getStudents(id);
  }

  @Get(':id/stats')
  @Roles('profesor')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30_000)
  @ApiOperation({
    summary: 'Estadísticas del curso (promedio, conteo de alumnos)',
  })
  getStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.getStats(id);
  }
}
