import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  createHmac,
  randomBytes,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from 'crypto';
import { MoreThan, Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';
import {
  PASSWORD_RESET_CODE_TTL_SECONDS,
  PASSWORD_RESET_EMAIL_RATE_LIMIT,
  PASSWORD_RESET_IP_RATE_LIMIT,
  PASSWORD_RESET_MAX_ATTEMPTS,
  PASSWORD_RESET_RATE_WINDOW_SECONDS,
  PASSWORD_RESET_RESEND_COOLDOWN_SECONDS,
  PASSWORD_RESET_TOKEN_BYTES,
  PASSWORD_RESET_TOKEN_TTL_SECONDS,
} from './auth.constants';
import { AuthRefreshSession } from './entities/auth-refresh-session.entity';
import { PasswordResetRequest } from './entities/password-reset-request.entity';
import {
  ForgotPasswordResponseDto,
  ResetPasswordResponseDto,
  VerifyResetCodeResponseDto,
} from './dto/password-reset-response.dto';

const FORGOT_PASSWORD_MESSAGE =
  'Si un compte correspond à cette adresse, un code de vérification a été envoyé.';

type VerificationResult =
  | { valid: false }
  | {
      valid: true;
      resetToken: string;
      resetTokenExpiresAt: Date;
    };

type PasswordResetResult =
  | { valid: false }
  | { valid: true; email: string; requestId: string };

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);
  private readonly secret: string;

  constructor(
    @InjectRepository(PasswordResetRequest)
    private readonly resetRequestsRepository: Repository<PasswordResetRequest>,
    private readonly mail: MailService,
    config: ConfigService,
  ) {
    this.secret = config.getOrThrow<string>('PASSWORD_RESET_SECRET');
    if (Buffer.byteLength(this.secret, 'utf8') < 32) {
      throw new Error('PASSWORD_RESET_SECRET must be at least 32 characters');
    }
  }

  async requestReset(
    rawEmail: string,
    requestIp: string,
  ): Promise<ForgotPasswordResponseDto> {
    const email = this.normalizeEmail(rawEmail);
    const emailHash = this.protect('email', email);
    const requestIpHash = this.protect('ip', requestIp || 'unknown');
    const now = new Date();
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const requestId = randomUUID();

    const delivery = await this.resetRequestsRepository.manager.transaction(
      async (manager) => {
        await manager.query(
          `SELECT pg_advisory_xact_lock(hashtext(lock_name))
           FROM unnest($1::text[]) AS locks(lock_name)
           ORDER BY lock_name`,
          [
            [
              `password-reset-email:${emailHash}`,
              `password-reset-ip:${requestIpHash}`,
            ].sort(),
          ],
        );
        const resetRepository = manager.getRepository(PasswordResetRequest);
        const latest = await resetRepository.findOne({
          where: { emailHash },
          order: { createdAt: 'DESC' },
        });

        if (
          latest &&
          now.getTime() - latest.createdAt.getTime() <
            PASSWORD_RESET_RESEND_COOLDOWN_SECONDS * 1000
        ) {
          return null;
        }

        const rateWindowStart = new Date(
          now.getTime() - PASSWORD_RESET_RATE_WINDOW_SECONDS * 1000,
        );
        const [emailRequests, ipRequests] = await Promise.all([
          resetRepository.count({
            where: { emailHash, createdAt: MoreThan(rateWindowStart) },
          }),
          resetRepository.count({
            where: {
              requestIpHash,
              createdAt: MoreThan(rateWindowStart),
            },
          }),
        ]);
        if (
          emailRequests >= PASSWORD_RESET_EMAIL_RATE_LIMIT ||
          ipRequests >= PASSWORD_RESET_IP_RATE_LIMIT
        ) {
          return null;
        }

        const user = await manager.getRepository(User).findOne({
          where: { email },
        });
        await resetRepository
          .createQueryBuilder()
          .update(PasswordResetRequest)
          .set({ revokedAt: now, codeHash: null, resetTokenHash: null })
          .where('"emailHash" = :emailHash', { emailHash })
          .andWhere('"revokedAt" IS NULL')
          .andWhere('"usedAt" IS NULL')
          .execute();

        const resetRequest = resetRepository.create({
          id: requestId,
          userId: user?.id ?? null,
          emailHash,
          requestIpHash,
          codeHash: this.protect(`code:${requestId}`, code),
          codeExpiresAt: new Date(
            now.getTime() + PASSWORD_RESET_CODE_TTL_SECONDS * 1000,
          ),
          verificationAttempts: 0,
          verifiedAt: null,
          resetTokenHash: null,
          resetTokenExpiresAt: null,
          usedAt: null,
          revokedAt: null,
        });
        await resetRepository.save(resetRequest);

        return user ? { email: user.email, code, requestId } : null;
      },
    );

    if (delivery) {
      void this.deliverResetCode(
        delivery.email,
        delivery.code,
        delivery.requestId,
      );
    }

    return { message: FORGOT_PASSWORD_MESSAGE };
  }

  async verifyCode(
    rawEmail: string,
    code: string,
  ): Promise<VerifyResetCodeResponseDto> {
    const email = this.normalizeEmail(rawEmail);
    const emailHash = this.protect('email', email);
    const result = await this.resetRequestsRepository.manager.transaction(
      async (manager): Promise<VerificationResult> => {
        await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
          `password-reset-email:${emailHash}`,
        ]);
        const resetRepository = manager.getRepository(PasswordResetRequest);
        const resetRequest = await resetRepository
          .createQueryBuilder('request')
          .setLock('pessimistic_write')
          .where('request.emailHash = :emailHash', { emailHash })
          .andWhere('request.revokedAt IS NULL')
          .andWhere('request.usedAt IS NULL')
          .andWhere('request.verifiedAt IS NULL')
          .andWhere('request.codeHash IS NOT NULL')
          .orderBy('request.createdAt', 'DESC')
          .getOne();
        if (!resetRequest) return { valid: false };

        const now = new Date();
        if (
          resetRequest.codeExpiresAt.getTime() <= now.getTime() ||
          resetRequest.verificationAttempts >= PASSWORD_RESET_MAX_ATTEMPTS
        ) {
          resetRequest.revokedAt = now;
          resetRequest.codeHash = null;
          await resetRepository.save(resetRequest);
          return { valid: false };
        }

        const submittedHash = this.protect(`code:${resetRequest.id}`, code);
        if (
          !resetRequest.codeHash ||
          !this.hashesEqual(resetRequest.codeHash, submittedHash) ||
          resetRequest.userId === null
        ) {
          resetRequest.verificationAttempts += 1;
          if (
            resetRequest.verificationAttempts >= PASSWORD_RESET_MAX_ATTEMPTS
          ) {
            resetRequest.revokedAt = now;
            resetRequest.codeHash = null;
          }
          await resetRepository.save(resetRequest);
          return { valid: false };
        }

        const resetToken = `bspr_${randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString('base64url')}`;
        const resetTokenExpiresAt = new Date(
          now.getTime() + PASSWORD_RESET_TOKEN_TTL_SECONDS * 1000,
        );
        resetRequest.verifiedAt = now;
        resetRequest.codeHash = null;
        resetRequest.resetTokenHash = this.protect('reset-token', resetToken);
        resetRequest.resetTokenExpiresAt = resetTokenExpiresAt;
        await resetRepository.save(resetRequest);

        return { valid: true, resetToken, resetTokenExpiresAt };
      },
    );

    if (!result.valid) throw this.invalidCode();
    return {
      resetToken: result.resetToken,
      resetTokenExpiresAt: result.resetTokenExpiresAt.toISOString(),
    };
  }

  async resetPassword(
    resetToken: string,
    newPassword: string,
  ): Promise<ResetPasswordResponseDto> {
    const resetTokenHash = this.protect('reset-token', resetToken);
    const result = await this.resetRequestsRepository.manager.transaction(
      async (manager): Promise<PasswordResetResult> => {
        const resetRepository = manager.getRepository(PasswordResetRequest);
        const resetRequest = await resetRepository
          .createQueryBuilder('request')
          .setLock('pessimistic_write')
          .where('request.resetTokenHash = :resetTokenHash', {
            resetTokenHash,
          })
          .andWhere('request.revokedAt IS NULL')
          .andWhere('request.usedAt IS NULL')
          .getOne();
        if (!resetRequest) return { valid: false };

        const now = new Date();
        if (
          !resetRequest.resetTokenExpiresAt ||
          resetRequest.resetTokenExpiresAt.getTime() <= now.getTime() ||
          resetRequest.userId === null
        ) {
          resetRequest.revokedAt = now;
          resetRequest.resetTokenHash = null;
          await resetRepository.save(resetRequest);
          return { valid: false };
        }

        const userRepository = manager.getRepository(User);
        const user = await userRepository
          .createQueryBuilder('user')
          .addSelect('user.authVersion')
          .setLock('pessimistic_write')
          .where('user.id = :userId', { userId: resetRequest.userId })
          .getOne();
        if (!user) {
          resetRequest.revokedAt = now;
          resetRequest.resetTokenHash = null;
          await resetRepository.save(resetRequest);
          return { valid: false };
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.authVersion = (user.authVersion ?? 0) + 1;
        await userRepository.save(user);

        resetRequest.usedAt = now;
        resetRequest.resetTokenHash = null;
        await resetRepository.save(resetRequest);
        await resetRepository
          .createQueryBuilder()
          .update(PasswordResetRequest)
          .set({ revokedAt: now, codeHash: null, resetTokenHash: null })
          .where('("userId" = :userId OR "emailHash" = :emailHash)', {
            userId: user.id,
            emailHash: resetRequest.emailHash,
          })
          .andWhere('"id" != :requestId', { requestId: resetRequest.id })
          .andWhere('"revokedAt" IS NULL')
          .andWhere('"usedAt" IS NULL')
          .execute();
        await manager
          .getRepository(AuthRefreshSession)
          .createQueryBuilder()
          .update(AuthRefreshSession)
          .set({ revokedAt: now })
          .where('"userId" = :userId', { userId: user.id })
          .andWhere('"revokedAt" IS NULL')
          .execute();

        return { valid: true, email: user.email, requestId: resetRequest.id };
      },
    );

    if (!result.valid) throw this.invalidResetToken();
    void this.deliverPasswordChangedConfirmation(
      result.email,
      result.requestId,
    );
    return {
      success: true,
      message: 'Votre mot de passe a été réinitialisé.',
    };
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private protect(purpose: string, value: string): string {
    return createHmac('sha256', this.secret)
      .update(`${purpose}\0${value}`, 'utf8')
      .digest('hex');
  }

  private hashesEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left, 'hex');
    const rightBuffer = Buffer.from(right, 'hex');
    return (
      leftBuffer.length === rightBuffer.length &&
      timingSafeEqual(leftBuffer, rightBuffer)
    );
  }

  private async deliverResetCode(
    email: string,
    code: string,
    requestId: string,
  ): Promise<void> {
    try {
      await this.mail.sendPasswordResetCode(email, code);
    } catch {
      this.logger.error(
        `Password reset email delivery failed for request ${requestId}`,
      );
      try {
        await this.resetRequestsRepository.update(requestId, {
          revokedAt: new Date(),
          codeHash: null,
        });
      } catch {
        this.logger.error(
          `Failed to invalidate undelivered password reset request ${requestId}`,
        );
      }
    }
  }

  private async deliverPasswordChangedConfirmation(
    email: string,
    requestId: string,
  ): Promise<void> {
    try {
      await this.mail.sendPasswordChangedConfirmation(email);
    } catch {
      this.logger.error(
        `Password-change confirmation delivery failed for request ${requestId}`,
      );
    }
  }

  private invalidCode(): UnauthorizedException {
    return new UnauthorizedException('Invalid or expired verification code');
  }

  private invalidResetToken(): UnauthorizedException {
    return new UnauthorizedException('Invalid or expired password reset token');
  }
}
