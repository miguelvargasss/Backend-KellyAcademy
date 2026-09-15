import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterLibraryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['documento', 'video', 'presentacion', 'audio', 'enlace', 'imagen'] })
  @IsOptional()
  @IsEnum(['documento', 'video', 'presentacion', 'audio', 'enlace', 'imagen'])
  type?: string;
}

export class CreateLibraryResourceDto {
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({
    enum: ['documento', 'video', 'presentacion', 'audio', 'enlace', 'imagen'],
  })
  @IsEnum(['documento', 'video', 'presentacion', 'audio', 'enlace', 'imagen'])
  type: string;
  @ApiPropertyOptional() @IsOptional() @IsString() courseTag?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fileUrl?: string;
}
export class UpdateLibraryResourceDto extends PartialType(
  CreateLibraryResourceDto,
) {}
export class PublishResourceDto {
  @ApiProperty() @IsBoolean() isPublished: boolean;
}
