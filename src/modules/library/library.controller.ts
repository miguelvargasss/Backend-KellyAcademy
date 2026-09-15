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
import { LibraryService } from './library.service';
import {
  CreateLibraryResourceDto,
  UpdateLibraryResourceDto,
  PublishResourceDto,
  FilterLibraryDto,
} from './dto/library.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Library')
@ApiBearerAuth()
@Controller('library')
export class LibraryController {
  constructor(private readonly service: LibraryService) {}
  @Get()
  @Roles('profesor')
  @ApiOperation({ summary: 'Listar recursos de la biblioteca' })
  findAll(
    @Query() filterDto: FilterLibraryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findAll(filterDto, user.sub, filterDto.type);
  }

  @Get('public')
  @ApiOperation({ summary: 'Listar recursos publicados (accesible por estudiantes)' })
  findPublished(@Query() filterDto: FilterLibraryDto) {
    return this.service.findPublished(filterDto, filterDto.type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un recurso' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('profesor')
  @ApiOperation({ summary: 'Crear recurso de biblioteca' })
  create(
    @Body() dto: CreateLibraryResourceDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.create(dto, user.sub);
  }
  @Patch(':id')
  @Roles('profesor')
  @ApiOperation({ summary: 'Actualizar recurso' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLibraryResourceDto,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @Roles('profesor')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar recurso' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
  @Patch(':id/publish')
  @Roles('profesor')
  @ApiOperation({ summary: 'Publicar o despublicar recurso' })
  setPublished(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PublishResourceDto,
  ) {
    return this.service.setPublished(id, dto);
  }
}
