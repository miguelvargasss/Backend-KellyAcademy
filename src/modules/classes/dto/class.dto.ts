import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateClassDto {
  @ApiProperty() @IsUUID() courseId: string;
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsDateString() scheduledAt: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) durationMin?: number;
  @ApiPropertyOptional({ enum: ['teams', 'zoom', 'meet', 'otro'] })
  @IsOptional()
  @IsEnum(['teams', 'zoom', 'meet', 'otro'])
  platform?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() meetingUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
export class UpdateClassDto extends PartialType(CreateClassDto) {}
