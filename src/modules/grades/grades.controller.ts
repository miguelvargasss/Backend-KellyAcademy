import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { GradesService } from './grades.service';
import { CreateGradeDto, UpdateGradeDto, FilterGradesDto } from './dto/grade.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Grades')
@ApiBearerAuth()
@Controller('grades')
export class GradesController {
  constructor(private readonly service: GradesService) {}

  @Get()
  @Roles('profesor')
  @ApiOperation({
    summary: 'Vista global de calificaciones (filtrable por courseId)',
  })
  findAll(@Query() filterDto: FilterGradesDto) {
    return this.service.findAll(filterDto, filterDto.courseId);
  }

  @Get('my')
  @Roles('estudiante')
  @ApiOperation({ summary: 'Mis calificaciones' })
  findMy(@CurrentUser() user: JwtPayload) {
    return this.service.findMy(user.sub);
  }

  @Post()
  @Roles('profesor')
  @ApiOperation({ summary: 'Calificar una entrega' })
  create(@Body() dto: CreateGradeDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.sub);
  }

  @Patch(':id')
  @Roles('profesor')
  @ApiOperation({ summary: 'Actualizar calificación' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateGradeDto) {
    return this.service.update(id, dto);
  }

  @Get('course/:courseId/activities')
  @Roles('profesor')
  @ApiOperation({ summary: 'Actividades del curso para el Libro de Calificaciones' })
  getCourseActivities(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.service.findActivitiesByCourse(courseId);
  }
}
