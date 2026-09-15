import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateWeekDto {
  @ApiProperty() @IsInt() @Min(1) weekNumber: number;
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}
export class UpdateWeekDto extends PartialType(CreateWeekDto) {}

export class CreateContentItemDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty({
    enum: ['video', 'archivo', 'tarea', 'quiz', 'evaluacion', 'enlace', 'imagen', 'audio'],
  })
  @IsEnum(['video', 'archivo', 'tarea', 'quiz', 'evaluacion', 'enlace', 'imagen', 'audio'])
  type: string;
  @ApiPropertyOptional({ enum: ['material', 'actividad'] })
  @IsOptional()
  @IsEnum(['material', 'actividad'])
  kind?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() meta?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() url?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() libraryResourceId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dueDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) maxScore?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isVisible?: boolean;
}
export class UpdateContentItemDto extends PartialType(CreateContentItemDto) {}

export class PublishItemDto {
  @ApiProperty() @IsBoolean() isPublished: boolean;
}
export class VisibilityItemDto {
  @ApiProperty() @IsBoolean() isVisible: boolean;
}
