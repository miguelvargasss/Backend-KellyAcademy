import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() code: string;
  @ApiPropertyOptional() @IsOptional() @IsString() subtitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() groupNumber?: string;
  @ApiPropertyOptional({ enum: ['remoto', 'presencial', 'hibrido'] })
  @IsOptional()
  @IsEnum(['remoto', 'presencial', 'hibrido'])
  modality?: 'remoto' | 'presencial' | 'hibrido';
  @ApiPropertyOptional() @IsOptional() @IsString() level?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bannerGradient?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() period?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) maxStudents?: number;
  @ApiPropertyOptional({ enum: ['abierto', 'en_progreso', 'cerrado', 'archivado'] })
  @IsOptional()
  @IsEnum(['abierto', 'en_progreso', 'cerrado', 'archivado'])
  status?: 'abierto' | 'en_progreso' | 'cerrado' | 'archivado';
}

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
