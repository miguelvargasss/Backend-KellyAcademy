import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * user.entity.ts — Entidad TypeORM que mapea la tabla `users`.
 * ─────────────────────────────────────────────────────────────
 * SRP: solo describe la estructura de datos del usuario.
 * synchronize: false — nunca altera la BD automáticamente.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', length: 150 })
  fullName: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ length: 30, nullable: true })
  phone: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string;

  @Column({
    length: 20,
    default: 'estudiante',
    enum: ['profesor', 'estudiante'],
  })
  role: 'profesor' | 'estudiante';

  @Column({
    length: 20,
    default: 'activo',
    enum: ['activo', 'inactivo', 'suspendido', 'en_riesgo'],
  })
  status: 'activo' | 'inactivo' | 'suspendido' | 'en_riesgo';

  @Column({ name: 'last_login', type: 'timestamptz', nullable: true })
  lastLogin: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
