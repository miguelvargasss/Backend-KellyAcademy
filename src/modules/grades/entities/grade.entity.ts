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
import { Submission } from '../../submissions/entities/submission.entity';

@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'submission_id', unique: true }) submissionId: string;
  @Column({ name: 'grader_id' }) graderId: string;
  @ManyToOne(() => Submission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submission_id' })
  submission: Submission;
  @OneToOne(() => Submission, (sub) => sub.grade)
  @JoinColumn({ name: 'submission_id' })
  submissionRel: Submission;
  @ManyToOne(() => User) @JoinColumn({ name: 'grader_id' }) grader: User;
  @Column({ type: 'numeric', precision: 6, scale: 2 }) score: number;
  @Column({ type: 'text', nullable: true }) feedback: string;
  @Column({ name: 'graded_at', type: 'timestamptz', default: () => 'NOW()' })
  gradedAt: Date;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
