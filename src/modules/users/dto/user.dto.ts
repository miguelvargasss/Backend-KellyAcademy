import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterUsersDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['profesor', 'estudiante'] })
  @IsOptional()
  @IsEnum(['profesor', 'estudiante'])
  role?: 'profesor' | 'estudiante';

  @ApiPropertyOptional({ enum: ['activo', 'inactivo', 'suspendido', 'en_riesgo'] })
  @IsOptional()
  @IsEnum(['activo', 'inactivo', 'suspendido', 'en_riesgo'])
  status?: 'activo' | 'inactivo' | 'suspendido' | 'en_riesgo';
}

export class CreateUserDto {
  @ApiProperty({ example: 'Ana Martínez' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'a.martinez@kelly.edu' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: '+57 300 111 2233' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    enum: ['profesor', 'estudiante'],
    default: 'estudiante',
  })
  @IsOptional()
  @IsEnum(['profesor', 'estudiante'])
  role?: 'profesor' | 'estudiante';
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UpdateUserStatusDto {
  @ApiProperty({ enum: ['activo', 'inactivo', 'suspendido', 'en_riesgo'] })
  @IsEnum(['activo', 'inactivo', 'suspendido', 'en_riesgo'])
  status: 'activo' | 'inactivo' | 'suspendido' | 'en_riesgo';
}

export class AssignCourseDto {
  @ApiProperty({ description: 'UUID del curso' })
  @IsString()
  courseId: string;
}
