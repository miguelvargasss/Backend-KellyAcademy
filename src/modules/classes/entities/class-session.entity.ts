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

@Entity('classes')
export class ClassSession {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'course_id' }) courseId: string;
  @Column({ name: 'teacher_id' }) teacherId: string;
  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;
  @ManyToOne(() => User) @JoinColumn({ name: 'teacher_id' }) teacher: User;
  @Column({ length: 300 }) title: string;
  @Column({ name: 'scheduled_at', type: 'timestamptz' }) scheduledAt: Date;
  @Column({ name: 'duration_min', type: 'integer', default: 60 })
  durationMin: number;
  @Column({
    length: 20,
    default: 'teams',
    enum: ['teams', 'zoom', 'meet', 'otro'],
  })
  platform: string;
  @Column({ name: 'meeting_url', type: 'text', nullable: true })
  meetingUrl: string;
  @Column({ type: 'text', nullable: true }) notes: string;
  @Column({
    length: 20,
    default: 'programada',
    enum: ['programada', 'en_curso', 'finalizada', 'cancelada'],
  })
  status: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
