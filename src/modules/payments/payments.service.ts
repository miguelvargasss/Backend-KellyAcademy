import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly repo: Repository<Payment>,
  ) {}
  async findAll(pagination: PaginationDto) {
    const [payments, total] = await this.repo.findAndCount({
      relations: ['student', 'course'],
      order: { dueDate: 'ASC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
    return {
      payments,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        pages: Math.ceil(total / pagination.limit),
      },
    };
  }
  async findMy(studentId: string) {
    return this.repo.find({
      where: { studentId },
      relations: ['course'],
      order: { dueDate: 'DESC' },
    });
  }
  async getSummary(studentId: string) {
    const payments = await this.repo.find({ where: { studentId } });
    const totalPaid = payments
      .filter((p) => p.status === 'pagado')
      .reduce((s, p) => s + Number(p.amount), 0);
    const pending = payments
      .filter((p) => p.status === 'pendiente')
      .reduce((s, p) => s + Number(p.amount), 0);
    return { totalPaid, pending, total: payments.length };
  }
  async create(dto: CreatePaymentDto): Promise<Payment> {
    return this.repo.save(dto);
  }
  async update(id: string, dto: UpdatePaymentDto): Promise<Payment> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException(`Pago ${id} no encontrado`);
    if (dto.status === 'pagado' && !p.paidAt)
      (dto as Record<string, unknown>)['paidAt'] = new Date();
    return this.repo.save({ ...p, ...dto });
  }
}
