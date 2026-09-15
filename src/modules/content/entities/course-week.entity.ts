import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Course } from '../../courses/entities/course.entity';

@Entity('course_weeks')
export class CourseWeek {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'course_id' }) courseId: string;
  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;
  @Column({ name: 'week_number', type: 'integer' }) weekNumber: number;
  @Column({ length: 200 }) title: string;
  @Column({ name: 'is_expanded', default: false }) isExpanded: boolean;
  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
