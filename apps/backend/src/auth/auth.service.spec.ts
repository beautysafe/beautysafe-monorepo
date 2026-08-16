import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import {
  DeepPartial,
  EntityManager,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { ACCESS_TOKEN_TTL_SECONDS } from './auth.constants';
import { AuthRefreshSession } from './entities/auth-refresh-session.entity';
import { AuthService } from './auth.service';

describe('AuthService refresh sessions', () => {
  let service: AuthService;
  let sessions: AuthRefreshSession[];
  let user: User;
  let usersService: Pick<UsersService, 'findByEmail'>;
  let jwtService: JwtService;

  beforeEach(() => {
    sessions = [];
    user = {
      id: 7,
      email: 'mobile@beautysafe.online',
      role: UserRole.CLIENT,
      password: '',
    } as User;
    usersService = {
      findByEmail: jest.fn().mockResolvedValue(user),
    };
    jwtService = new JwtService({
      secret: 'refresh-session-test-secret',
      signOptions: { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
    });

    let nextId = 1;
    const userRepository = {
      findOne: jest.fn((options: FindOneOptions<User>) => {
        const where = options.where as FindOptionsWhere<User>;
        return Promise.resolve(where.id === user.id ? user : null);
      }),
    } as unknown as Repository<User>;
    const sessionsRepository = {
      create: jest.fn((value: DeepPartial<AuthRefreshSession>) =>
        Object.assign(new AuthRefreshSession(), value),
      ),
      save: jest.fn((session: AuthRefreshSession) => {
        if (!session.id) {
          session.id = nextId++;
          session.createdAt = new Date();
          session.updatedAt = new Date();
          sessions.push(session);
        } else {
          session.updatedAt = new Date();
        }
        return Promise.resolve(session);
      }),
      createQueryBuilder: jest.fn((alias?: string) => {
        if (alias === 'session') {
          let tokenHash = '';
          const queryBuilder = {
            setLock: jest.fn().mockReturnThis(),
            where: jest
              .fn()
              .mockImplementation(
                (_query: string, parameters: { tokenHash: string }) => {
                  tokenHash = parameters.tokenHash;
                  return queryBuilder;
                },
              ),
            getOne: jest
              .fn()
              .mockImplementation(() =>
                Promise.resolve(
                  sessions.find((session) => session.tokenHash === tokenHash),
                ),
              ),
          };
          return queryBuilder;
        }

        let tokenHash = '';
        let revokedAt = new Date();
        const updateBuilder = {
          update: jest.fn().mockReturnThis(),
          set: jest.fn().mockImplementation((value: { revokedAt: Date }) => {
            revokedAt = value.revokedAt;
            return updateBuilder;
          }),
          where: jest
            .fn()
            .mockImplementation(
              (_query: string, parameters: { tokenHash: string }) => {
                tokenHash = parameters.tokenHash;
                return updateBuilder;
              },
            ),
          andWhere: jest.fn().mockReturnThis(),
          execute: jest.fn().mockImplementation(() => {
            const session = sessions.find(
              (candidate) =>
                candidate.tokenHash === tokenHash && !candidate.revokedAt,
            );
            if (session) session.revokedAt = revokedAt;
            return Promise.resolve({ affected: session ? 1 : 0 });
          }),
        };
        return updateBuilder;
      }),
      manager: undefined,
    } as unknown as Repository<AuthRefreshSession>;
    const manager = {
      getRepository: jest.fn((entity: unknown) =>
        entity === AuthRefreshSession ? sessionsRepository : userRepository,
      ),
    } as unknown as EntityManager;
    Object.assign(sessionsRepository, {
      manager: {
        transaction: jest.fn(
          <T>(callback: (manager: EntityManager) => Promise<T>) =>
            callback(manager),
        ),
      },
    });

    service = new AuthService(
      usersService as UsersService,
      jwtService,
      sessionsRepository,
    );
  });

  it('returns access and refresh tokens for valid credentials', async () => {
    user.password = await bcrypt.hash('correct-password', 4);

    const authenticated = await service.validateUser(
      user.email,
      'correct-password',
    );
    expect(authenticated).not.toBeNull();
    const response = await service.login(authenticated!);
    const accessPayload = jwtService.verify<{
      sub: number;
      username: string;
      role: UserRole;
      iat: number;
      exp: number;
    }>(response.accessToken);

    expect(Object.keys(response).sort()).toEqual(
      [
        'accessToken',
        'accessTokenExpiresAt',
        'access_token',
        'refreshToken',
        'refreshTokenExpiresAt',
      ].sort(),
    );
    expect(typeof response.accessToken).toBe('string');
    expect(response.access_token).toBe(response.accessToken);
    expect(response.refreshToken).toMatch(/^bsrt_/);
    expect(typeof response.accessTokenExpiresAt).toBe('string');
    expect(typeof response.refreshTokenExpiresAt).toBe('string');
    expect(accessPayload).toMatchObject({
      sub: user.id,
      username: user.email,
      role: UserRole.CLIENT,
    });
    expect(accessPayload.exp - accessPayload.iat).toBe(
      ACCESS_TOKEN_TTL_SECONDS,
    );
    expect(
      Date.parse(response.refreshTokenExpiresAt) - Date.now(),
    ).toBeGreaterThan(364 * 24 * 60 * 60 * 1000);
    expect(sessions).toHaveLength(1);
    expect(sessions[0].tokenHash).toBe(
      createHash('sha256').update(response.refreshToken, 'utf8').digest('hex'),
    );
    expect(sessions[0].tokenHash).not.toContain(response.refreshToken);
  });

  it('rotates a valid token and rejects reuse of the old token', async () => {
    const login = await service.login(user);
    const refreshed = await service.refresh(login.refreshToken);

    expect(refreshed.accessToken).not.toBe(login.accessToken);
    expect(refreshed.refreshToken).not.toBe(login.refreshToken);
    expect(refreshed.refreshTokenExpiresAt).toBe(login.refreshTokenExpiresAt);
    expect(Object.keys(refreshed).sort()).toEqual(
      [
        'accessToken',
        'accessTokenExpiresAt',
        'refreshToken',
        'refreshTokenExpiresAt',
      ].sort(),
    );
    expect(sessions).toHaveLength(2);
    expect(sessions[0].revokedAt).toBeInstanceOf(Date);
    expect(sessions[1].revokedAt).toBeNull();
    await expect(service.refresh(login.refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects an expired refresh token', async () => {
    const login = await service.login(user);
    sessions[0].expiresAt = new Date(Date.now() - 1_000);

    await expect(service.refresh(login.refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects an invalid refresh token', async () => {
    await expect(
      service.refresh('bsrt_not-a-real-refresh-token'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a revoked refresh token', async () => {
    const login = await service.login(user);
    sessions[0].revokedAt = new Date();

    await expect(service.refresh(login.refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('logs out idempotently and prevents future refresh', async () => {
    const login = await service.login(user);

    await expect(service.logout(login.refreshToken)).resolves.toEqual({
      success: true,
    });
    await expect(service.logout(login.refreshToken)).resolves.toEqual({
      success: true,
    });
    await expect(service.refresh(login.refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
