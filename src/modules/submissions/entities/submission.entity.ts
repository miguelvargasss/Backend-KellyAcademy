import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CourseContentItem } from '../../content/entities/course-content-item.entity';
import { Grade } from '../../grades/entities/grade.entity';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'item_id' }) itemId: string;
  @Column({ name: 'student_id' }) studentId: string;
  @ManyToOne(() => CourseContentItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: CourseContentItem;
  @ManyToOne(() => User) @JoinColumn({ name: 'student_id' }) student: User;
  @Column({ name: 'file_url', type: 'text', nullable: true }) fileUrl: string;
  @Column({ name: 'text_content', type: 'text', nullable: true })
  textContent: string;
  @Column({ name: 'submitted_at', type: 'timestamptz', default: () => 'NOW()' })
  submittedAt: Date;
  @Column({ name: 'is_late', default: false }) isLate: boolean;
  @Column({
    length: 20,
    default: 'pendiente',
    enum: ['pendiente', 'calificado', 'vencido'],
  })
  status: string;
  @OneToOne(() => Grade, (grade) => grade.submission)
  grade: Grade;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
