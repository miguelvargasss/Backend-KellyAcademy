import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}
  @Get()
  @Roles('profesor')
  @ApiOperation({ summary: 'Listar todos los pagos' })
  findAll(@Query() p: PaginationDto) {
    return this.service.findAll(p);
  }
  @Get('my')
  @Roles('estudiante')
  @ApiOperation({ summary: 'Mis pagos' })
  findMy(@CurrentUser() user: JwtPayload) {
    return this.service.findMy(user.sub);
  }
  @Get('summary')
  @Roles('estudiante')
  @ApiOperation({ summary: 'Resumen de pagos del estudiante' })
  getSummary(@CurrentUser() user: JwtPayload) {
    return this.service.getSummary(user.sub);
  }
  @Post()
  @Roles('profesor')
  @ApiOperation({ summary: 'Registrar pago (ingreso manual)' })
  create(@Body() dto: CreatePaymentDto) {
    return this.service.create(dto);
  }
  @Patch(':id')
  @Roles('profesor')
  @ApiOperation({ summary: 'Actualizar estado de pago' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.service.update(id, dto);
  }
}
