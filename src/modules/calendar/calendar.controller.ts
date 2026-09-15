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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import {
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
} from './dto/calendar.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Calendar')
@ApiBearerAuth()
@Controller('calendar')
export class CalendarController {
  constructor(private readonly service: CalendarService) {}
  @Get()
  @ApiOperation({ summary: 'Mis eventos de calendario' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('courseId') courseId?: string,
  ) {
    return this.service.findAll(user.sub, courseId);
  }
  @Get('course/:courseId')
  @ApiOperation({ summary: 'Eventos del curso' })
  findByCourse(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.service.findByCourse(courseId);
  }
  @Post()
  @Roles('profesor')
  @ApiOperation({ summary: 'Crear evento de calendario' })
  create(@Body() dto: CreateCalendarEventDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.sub);
  }
  @Patch(':id')
  @Roles('profesor')
  @ApiOperation({ summary: 'Actualizar evento' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCalendarEventDto,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Roles('profesor')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar evento' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
