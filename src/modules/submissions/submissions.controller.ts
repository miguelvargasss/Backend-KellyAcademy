import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/submission.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Submissions')
@ApiBearerAuth()
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly service: SubmissionsService) {}

  @Post()
  @Roles('estudiante')
  @ApiOperation({ summary: 'Entregar una actividad' })
  create(@Body() dto: CreateSubmissionDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.sub);
  }

  @Get('my')
  @Roles('estudiante')
  @ApiOperation({ summary: 'Mis entregas' })
  findMy(@CurrentUser() user: JwtPayload) {
    return this.service.findMy(user.sub);
  }

  @Get('item/:itemId')
  @ApiOperation({ summary: 'Entregas de un ítem (vista profesor)' })
  findByItem(@Param('itemId', ParseUUIDPipe) itemId: string) {
    return this.service.findByItem(itemId);
  }

  @Get('item/:itemId/students')
  @Roles('profesor')
  @ApiOperation({ summary: 'Entregas del ítem con todos los alumnos del curso (Libro de Calificaciones)' })
  findByItemWithAllStudents(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Query('courseId') courseId: string,
  ) {
    return this.service.findByItemWithAllStudents(itemId, courseId);
  }
}
