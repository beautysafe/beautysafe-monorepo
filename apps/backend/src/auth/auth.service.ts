import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_BYTES,
  REFRESH_TOKEN_TTL_SECONDS,
} from './auth.constants';
import {
  AuthTokenResponseDto,
  LoginResponseDto,
  LogoutResponseDto,
} from './dto/auth-token-response.dto';
import { AuthRefreshSession } from './entities/auth-refresh-session.entity';

type AuthenticatedUser = Pick<User, 'id' | 'email' | 'role'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(AuthRefreshSession)
    private readonly refreshSessionsRepository: Repository<AuthRefreshSession>,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthenticatedUser | null> {
    if (!email || !password) return null;

    const user = await this.usersService.findByEmail(email.toLowerCase());
    if (!user?.password) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(user: AuthenticatedUser): Promise<LoginResponseDto> {
    const now = new Date();
    const refreshExpiresAt = new Date(
      now.getTime() + REFRESH_TOKEN_TTL_SECONDS * 1000,
    );
    const tokens = await this.issueTokenPair(
      user,
      this.refreshSessionsRepository,
      refreshExpiresAt,
      now,
    );

    return {
      ...tokens,
      access_token: tokens.accessToken,
    };
  }

  async refresh(refreshToken: string): Promise<AuthTokenResponseDto> {
    const tokenHash = this.hashRefreshToken(refreshToken);

    return this.refreshSessionsRepository.manager.transaction(
      async (manager) => {
        const sessionsRepository = manager.getRepository(AuthRefreshSession);
        const session = await sessionsRepository
          .createQueryBuilder('session')
          .setLock('pessimistic_write')
          .where('session.tokenHash = :tokenHash', { tokenHash })
          .getOne();
        const now = new Date();

        if (
          !session ||
          session.revokedAt !== null ||
          session.expiresAt.getTime() <= now.getTime()
        ) {
          throw this.invalidRefreshToken();
        }

        const user = await manager.getRepository(User).findOne({
          where: { id: session.userId },
        });
        if (!user) throw this.invalidRefreshToken();

        session.revokedAt = now;
        await sessionsRepository.save(session);

        return this.issueTokenPair(
          { id: user.id, email: user.email, role: user.role },
          sessionsRepository,
          session.expiresAt,
          now,
        );
      },
    );
  }

  async logout(refreshToken: string): Promise<LogoutResponseDto> {
    const tokenHash = this.hashRefreshToken(refreshToken);
    await this.refreshSessionsRepository
      .createQueryBuilder()
      .update(AuthRefreshSession)
      .set({ revokedAt: new Date() })
      .where('"tokenHash" = :tokenHash', { tokenHash })
      .andWhere('"revokedAt" IS NULL')
      .execute();

    return { success: true };
  }

  private async issueTokenPair(
    user: AuthenticatedUser,
    sessionsRepository: Repository<AuthRefreshSession>,
    refreshExpiresAt: Date,
    now: Date,
  ): Promise<AuthTokenResponseDto> {
    const payload: {
      username: string;
      sub: number;
      role: UserRole;
      jti: string;
    } = {
      username: user.email,
      sub: user.id,
      role: user.role,
      jti: randomUUID(),
    };
    const accessToken = this.jwtService.sign(payload);
    const accessIssuedAtSeconds = Math.floor(now.getTime() / 1000);
    const accessTokenExpiresAt = new Date(
      (accessIssuedAtSeconds + ACCESS_TOKEN_TTL_SECONDS) * 1000,
    );
    const refreshToken = this.generateRefreshToken();
    const session = sessionsRepository.create({
      userId: user.id,
      tokenHash: this.hashRefreshToken(refreshToken),
      expiresAt: refreshExpiresAt,
      revokedAt: null,
    });
    await sessionsRepository.save(session);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: accessTokenExpiresAt.toISOString(),
      refreshTokenExpiresAt: refreshExpiresAt.toISOString(),
    };
  }

  private generateRefreshToken() {
    return `bsrt_${randomBytes(REFRESH_TOKEN_BYTES).toString('base64url')}`;
  }

  private hashRefreshToken(token: string) {
    return createHash('sha256').update(token, 'utf8').digest('hex');
  }

  private invalidRefreshToken() {
    return new UnauthorizedException('Invalid refresh token');
  }
}
