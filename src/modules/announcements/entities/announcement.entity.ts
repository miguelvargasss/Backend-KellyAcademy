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

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'course_id' }) courseId: string;
  @Column({ name: 'author_id' }) authorId: string;
  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;
  @ManyToOne(() => User) @JoinColumn({ name: 'author_id' }) author: User;
  @Column({ length: 300 }) title: string;
  @Column({ type: 'text' }) content: string;
  @Column({ name: 'is_pinned', default: false }) isPinned: boolean;
  @Column({ name: 'is_published', default: true }) isPublished: boolean;
  @Column({ name: 'published_at', type: 'timestamptz', default: () => 'NOW()' })
  publishedAt: Date;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
