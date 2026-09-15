import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCalendarEventDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() courseId?: string;
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({
    enum: [
      'clase',
      'tarea',
      'quiz',
      'evaluacion',
      'pago',
      'anuncio',
      'general',
    ],
  })
  @IsOptional()
  @IsEnum([
    'clase',
    'tarea',
    'quiz',
    'evaluacion',
    'pago',
    'anuncio',
    'general',
  ])
  eventType?: string;
  @ApiProperty() @IsDateString() startsAt: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endsAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() allDay?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() color?: string;
}
export class UpdateCalendarEventDto extends PartialType(
  CreateCalendarEventDto,
) {}
