import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'student_id' }) studentId: string;
  @Column({ name: 'course_id', nullable: true }) courseId: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'student_id' }) student: User;
  @ManyToOne(() => Course, { nullable: true })
  @JoinColumn({ name: 'course_id' })
  course: Course;
  @Column({ length: 300 }) concept: string;
  @Column({ type: 'numeric', precision: 10, scale: 2 }) amount: number;
  @Column({ length: 3, default: 'USD' }) currency: string;
  @Column({ name: 'issue_date', type: 'date', default: () => 'CURRENT_DATE' })
  issueDate: string;
  @Column({ name: 'due_date', type: 'date' }) dueDate: string;
  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date;
  @Column({
    length: 20,
    default: 'pendiente',
    enum: ['pendiente', 'pagado', 'vencido', 'procesando'],
  })
  status: string;
  @Column({ name: 'payment_method', length: 100, nullable: true })
  paymentMethod: string;
  @Column({ length: 100, nullable: true }) reference: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
