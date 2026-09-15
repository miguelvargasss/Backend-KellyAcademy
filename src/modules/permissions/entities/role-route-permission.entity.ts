import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AppRoute } from './app-route.entity';

@Entity('role_route_permissions')
export class RoleRoutePermission {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'route_id' }) routeId: string;
  @ManyToOne(() => AppRoute, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route: AppRoute;
  @Column({ length: 20, enum: ['profesor', 'estudiante'] }) role:
    'profesor' | 'estudiante';
  @Column({ name: 'can_access', default: true }) canAccess: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
