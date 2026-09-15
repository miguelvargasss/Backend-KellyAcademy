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
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateClassDto, UpdateClassDto } from './dto/class.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Classes')
@ApiBearerAuth()
@Controller('classes')
export class ClassesController {
  constructor(private readonly service: ClassesService) {}
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30_000) // 30 s — próximas clases
  @ApiOperation({ summary: 'Listar todas las clases sincrónicas' })
  findAll(@Query() p: PaginationDto) {
    return this.service.findAll(p);
  }
  @Post()
  @Roles('profesor')
  @ApiOperation({ summary: 'Programar nueva clase' })
  create(@Body() dto: CreateClassDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.sub);
  }
  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(120_000) // 2 min
  @ApiOperation({ summary: 'Detalle de una clase' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }
  @Patch(':id')
  @Roles('profesor')
  @ApiOperation({ summary: 'Actualizar clase' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateClassDto) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Roles('profesor')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar / eliminar clase' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
