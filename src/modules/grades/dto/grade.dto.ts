import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterGradesDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  courseId?: string;
}

export class CreateGradeDto {
  @ApiProperty() @IsUUID() submissionId: string;
  @ApiProperty() @IsNumber() @Min(0) score: number;
  @ApiPropertyOptional() @IsOptional() @IsString() feedback?: string;
}
export class UpdateGradeDto extends PartialType(CreateGradeDto) {}
