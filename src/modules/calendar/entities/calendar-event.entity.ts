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

@Entity('calendar_events')
export class CalendarEvent {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'course_id', nullable: true }) courseId: string;
  @Column({ name: 'creator_id' }) creatorId: string;
  @ManyToOne(() => Course, { nullable: true })
  @JoinColumn({ name: 'course_id' })
  course: Course;
  @ManyToOne(() => User) @JoinColumn({ name: 'creator_id' }) creator: User;
  @Column({ length: 300 }) title: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({
    name: 'event_type',
    length: 30,
    default: 'general',
    enum: [
      'clase',
      'tarea',
      'quiz',
      'evaluacion',
      'pago',
      'anuncio',
      'general',
    ],
  })
  eventType: string;
  @Column({ name: 'starts_at', type: 'timestamptz' }) startsAt: Date;
  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt: Date;
  @Column({ name: 'all_day', default: false }) allDay: boolean;
  @Column({ length: 20, nullable: true }) color: string;
  @Column({ name: 'related_item_id', type: 'uuid', nullable: true })
  relatedItemId: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
