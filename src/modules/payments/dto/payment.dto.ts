import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() courseId?: string;
  @ApiProperty() @IsString() concept: string;
  @ApiProperty() @IsNumber() @Min(0.01) amount: number;
  @ApiPropertyOptional() @IsOptional() @IsString() currency?: string;
  @ApiProperty() @IsDateString() dueDate: string;
  @ApiPropertyOptional({
    enum: ['pendiente', 'pagado', 'vencido', 'procesando'],
  })
  @IsOptional()
  @IsEnum(['pendiente', 'pagado', 'vencido', 'procesando'])
  status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() paymentMethod?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reference?: string;
}
export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}
