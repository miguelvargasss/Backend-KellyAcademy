import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CourseWeek } from './course-week.entity';

@Entity('course_content_items')
export class CourseContentItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'week_id' }) weekId: string;
  @ManyToOne(() => CourseWeek, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'week_id' })
  week: CourseWeek;
  @Column({ length: 300 }) title: string;
  @Column({
    length: 20,
    enum: ['video', 'archivo', 'tarea', 'quiz', 'evaluacion', 'enlace', 'imagen', 'audio'],
  })
  type: string;
  @Column({ length: 20, enum: ['material', 'actividad'] }) kind: string;
  @Column({ length: 200, nullable: true }) meta: string;
  @Column({ type: 'text', nullable: true }) url: string;
  @Column({ name: 'library_resource_id', nullable: true })
  libraryResourceId: string;
  @Column({ name: 'is_published', default: false }) isPublished: boolean;
  @Column({ name: 'is_visible', default: false }) isVisible: boolean;
  @Column({ name: 'due_date', type: 'date', nullable: true }) dueDate: string;
  @Column({
    name: 'max_score',
    type: 'numeric',
    precision: 6,
    scale: 2,
    nullable: true,
  })
  maxScore: number;
  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
