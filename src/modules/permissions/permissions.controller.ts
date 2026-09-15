import {
  Controller,
  Get,
  Post,
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
import { PermissionsService } from './permissions.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class SetPermissionDto {
  @ApiProperty({ enum: ['profesor', 'estudiante'] })
  @IsEnum(['profesor', 'estudiante'])
  role: string;
  @ApiProperty() @IsBoolean() canAccess: boolean;
}
class CheckPermissionDto {
  @ApiProperty() @IsString() path: string;
  @ApiProperty({ enum: ['profesor', 'estudiante'] })
  @IsEnum(['profesor', 'estudiante'])
  role: string;
}

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly service: PermissionsService) {}

  @Get('routes')
  @ApiOperation({ summary: 'Listar todas las rutas de la app' })
  findAllRoutes() {
    return this.service.findAllRoutes();
  }

  @Get('routes/role')
  @ApiOperation({ summary: 'Rutas accesibles por un rol dado' })
  @ApiQuery({ name: 'role', enum: ['profesor', 'estudiante'] })
  findRoutesForRole(@Query('role') role: string) {
    return this.service.findRoutesForRole(role);
  }

  @Post('check')
  @ApiOperation({ summary: 'Verificar si un rol puede acceder a una ruta' })
  checkAccess(@Body() dto: CheckPermissionDto) {
    return this.service.canAccess(dto.path, dto.role);
  }

  @Post('routes/:routeId')
  @Roles('profesor')
  @ApiOperation({ summary: 'Actualizar permiso de rol sobre una ruta' })
  setPermission(
    @Param('routeId', ParseUUIDPipe) routeId: string,
    @Body() dto: SetPermissionDto,
  ) {
    return this.service.setPermission(routeId, dto.role, dto.canAccess);
  }
}
