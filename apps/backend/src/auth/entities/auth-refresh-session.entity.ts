import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('auth_refresh_sessions')
@Unique('UQ_auth_refresh_sessions_token_hash', ['tokenHash'])
@Index('IDX_auth_refresh_sessions_user_id', ['userId'])
@Index('IDX_auth_refresh_sessions_expires_at', ['expiresAt'])
@Index('IDX_auth_refresh_sessions_revoked_at', ['revokedAt'])
export class AuthRefreshSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'char', length: 64 })
  tokenHash: string;

  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  revokedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user?: User;
}
