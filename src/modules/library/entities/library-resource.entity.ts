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

@Entity('library_resources')
export class LibraryResource {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'owner_id' }) ownerId: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'owner_id' }) owner: User;
  @Column({ length: 300 }) title: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({
    length: 20,
    enum: ['documento', 'video', 'presentacion', 'audio', 'enlace', 'imagen'],
  })
  type: string;
  @Column({ name: 'course_tag', length: 100, nullable: true })
  courseTag: string;
  @Column({ name: 'file_url', type: 'text', nullable: true }) fileUrl: string;
  @Column({ name: 'file_size_bytes', type: 'bigint', nullable: true })
  fileSizeBytes: number;
  @Column({ name: 'mime_type', length: 100, nullable: true }) mimeType: string;
  @Column({ name: 'is_published', default: false }) isPublished: boolean;
  @Column({ name: 'usage_count', type: 'integer', default: 0 })
  usageCount: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
