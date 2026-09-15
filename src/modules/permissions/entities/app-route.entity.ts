import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('app_routes')
export class AppRoute {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 255, unique: true }) path: string;
  @Column({ length: 100 }) name: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ length: 50 }) module: string;
  @Column({ name: 'is_public', default: false }) isPublic: boolean;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
