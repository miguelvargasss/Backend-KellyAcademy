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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserStatusDto,
  AssignCourseDto,
  FilterUsersDto,
} from './dto/user.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

/**
 * users.controller.ts — API REST para gestión de usuarios.
 * ─────────────────────────────────────────────────────────
 * SRP: routing y serialización. Toda la lógica está en UsersService.
 */
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** GET /users — Lista todos los usuarios (solo profesor) */
  @Roles('profesor')
  @Get()
  @ApiOperation({
    summary: 'Listar usuarios (paginado, filtrable por rol y estado)',
  })
  findAll(@Query() filterDto: FilterUsersDto) {
    return this.usersService.findAll(filterDto, filterDto.role, filterDto.status);
  }

  /** POST /users — Crear nuevo usuario */
  @Roles('profesor')
  @Post()
  @ApiOperation({ summary: 'Crear nuevo usuario (estudiante o profesor)' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  /** GET /users/:id — Obtener un usuario */
  @Roles('profesor')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  /** PATCH /users/:id — Actualizar usuario */
  @Roles('profesor')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de usuario' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  /** PATCH /users/:id/status — Cambiar estado del usuario */
  @Roles('profesor')
  @Patch(':id/status')
  @ApiOperation({ summary: 'Cambiar estado de cuenta del usuario' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateStatus(id, dto);
  }

  /** DELETE /users/:id — Eliminar usuario */
  @Roles('profesor')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar usuario del sistema' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }

  /** GET /users/:id/courses — Cursos del estudiante */
  @Roles('profesor')
  @Get(':id/courses')
  @ApiOperation({ summary: 'Obtener cursos asignados a un estudiante' })
  findCourses(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findCourses(id);
  }

  /** POST /users/:id/courses — Asignar alumno a curso */
  @Roles('profesor')
  @Post(':id/courses')
  @ApiOperation({ summary: 'Asignar estudiante a un curso' })
  assignCourse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignCourseDto,
  ) {
    return this.usersService.assignCourse(id, dto);
  }

  /** DELETE /users/:id/courses/:courseId — Remover alumno de curso */
  @Roles('profesor')
  @Delete(':id/courses/:courseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover estudiante de un curso' })
  removeCourse(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.usersService.removeCourse(id, courseId);
  }
}
