import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('password_reset_requests')
@Index('IDX_password_reset_requests_user_id', ['userId'])
@Index('IDX_password_reset_requests_email_created', ['emailHash', 'createdAt'])
@Index('IDX_password_reset_requests_ip_created', ['requestIpHash', 'createdAt'])
@Unique('UQ_password_reset_requests_token_hash', ['resetTokenHash'])
export class PasswordResetRequest {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'integer', nullable: true })
  userId: number | null;

  @Column({ type: 'char', length: 64 })
  emailHash: string;

  @Column({ type: 'char', length: 64 })
  requestIpHash: string;

  @Column({ type: 'char', length: 64, nullable: true })
  codeHash: string | null;

  @Column({ type: 'timestamp with time zone' })
  codeExpiresAt: Date;

  @Column({ type: 'smallint', default: 0 })
  verificationAttempts: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  verifiedAt: Date | null;

  @Column({ type: 'char', length: 64, nullable: true })
  resetTokenHash: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  resetTokenExpiresAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  usedAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  revokedAt: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user?: User | null;
}
