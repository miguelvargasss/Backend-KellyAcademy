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

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'teacher_id' })
  teacherId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @Column({ length: 200 })
  title: string;

  @Column({ length: 300, nullable: true })
  subtitle: string;

  @Column({ length: 60, unique: true })
  code: string;

  @Column({ name: 'group_number', length: 50, nullable: true })
  groupNumber: string;

  @Column({
    length: 20,
    default: 'remoto',
    enum: ['remoto', 'presencial', 'hibrido'],
  })
  modality: 'remoto' | 'presencial' | 'hibrido';

  @Column({ length: 30, nullable: true })
  level: string;

  @Column({
    length: 20,
    default: 'abierto',
    enum: ['abierto', 'en_progreso', 'cerrado', 'archivado'],
  })
  status: 'abierto' | 'en_progreso' | 'cerrado' | 'archivado';

  @Column({ name: 'banner_gradient', length: 100, nullable: true })
  bannerGradient: string;

  @Column({ length: 50, nullable: true })
  period: string;

  @Column({ name: 'max_students', type: 'integer', nullable: true })
  maxStudents: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
