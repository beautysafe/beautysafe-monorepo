import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { User, UserRole } from '../users/entities/user.entity';
import { AuthRefreshSession } from './entities/auth-refresh-session.entity';
import { PasswordResetRequest } from './entities/password-reset-request.entity';
import { PasswordResetService } from './password-reset.service';

type Harness = {
  service: PasswordResetService;
  requests: PasswordResetRequest[];
  sessions: AuthRefreshSession[];
  user: User;
  mail: {
    sendPasswordResetCode: jest.Mock;
    sendPasswordChangedConfirmation: jest.Mock;
  };
  lastCode: () => string;
};

const createHarness = (): Harness => {
  const requests: PasswordResetRequest[] = [];
  const sessions = [
    Object.assign(new AuthRefreshSession(), {
      id: 1,
      userId: 7,
      tokenHash: 'a'.repeat(64),
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    }),
  ];
  const user = Object.assign(new User(), {
    id: 7,
    email: 'user@example.com',
    password: 'old-password-hash',
    role: UserRole.CLIENT,
    authVersion: 0,
  });
  let deliveredCode = '';
  const mail = {
    sendPasswordResetCode: jest.fn((_email: string, code: string) => {
      deliveredCode = code;
      return Promise.resolve();
    }),
    sendPasswordChangedConfirmation: jest.fn().mockResolvedValue(undefined),
  };

  const resetUpdateBuilder = () => {
    let values: Partial<PasswordResetRequest> = {};
    const parameters: Record<string, unknown> = {};
    const builder: Record<string, jest.Mock> = {};
    builder.update = jest.fn().mockReturnValue(builder);
    builder.set = jest.fn((next: Partial<PasswordResetRequest>) => {
      values = next;
      return builder;
    });
    builder.where = jest.fn(
      (_query: string, next: Record<string, unknown> = {}) => {
        Object.assign(parameters, next);
        return builder;
      },
    );
    builder.andWhere = jest.fn(
      (_query: string, next: Record<string, unknown> = {}) => {
        Object.assign(parameters, next);
        return builder;
      },
    );
    builder.execute = jest.fn(() => {
      const matches = requests.filter((request) => {
        if (
          parameters.emailHash &&
          request.emailHash !== parameters.emailHash
        ) {
          return false;
        }
        if (parameters.requestId && request.id === parameters.requestId) {
          return false;
        }
        return !request.revokedAt && !request.usedAt;
      });
      matches.forEach((request) => Object.assign(request, values));
      return Promise.resolve({ affected: matches.length });
    });
    return builder;
  };

  const resetSelectBuilder = () => {
    const parameters: Record<string, string> = {};
    const builder: Record<string, jest.Mock> = {};
    builder.setLock = jest.fn().mockReturnValue(builder);
    builder.where = jest.fn(
      (_query: string, next: Record<string, string> = {}) => {
        Object.assign(parameters, next);
        return builder;
      },
    );
    builder.andWhere = jest.fn().mockReturnValue(builder);
    builder.orderBy = jest.fn().mockReturnValue(builder);
    builder.getOne = jest.fn(() => {
      if (parameters.resetTokenHash) {
        return Promise.resolve(
          requests.find(
            (request) =>
              request.resetTokenHash === parameters.resetTokenHash &&
              !request.revokedAt &&
              !request.usedAt,
          ) ?? null,
        );
      }
      return Promise.resolve(
        [...requests]
          .sort(
            (left, right) =>
              right.createdAt.getTime() - left.createdAt.getTime(),
          )
          .find(
            (request) =>
              request.emailHash === parameters.emailHash &&
              !request.revokedAt &&
              !request.usedAt &&
              !request.verifiedAt &&
              Boolean(request.codeHash),
          ) ?? null,
      );
    });
    return builder;
  };

  const resetRepository = {
    findOne: jest.fn((options: { where: { emailHash: string } }) =>
      Promise.resolve(
        [...requests]
          .sort(
            (left, right) =>
              right.createdAt.getTime() - left.createdAt.getTime(),
          )
          .find((request) => request.emailHash === options.where.emailHash) ??
          null,
      ),
    ),
    count: jest.fn((options: { where: Partial<PasswordResetRequest> }) =>
      Promise.resolve(
        requests.filter((request) =>
          options.where.emailHash
            ? request.emailHash === options.where.emailHash
            : request.requestIpHash === options.where.requestIpHash,
        ).length,
      ),
    ),
    create: jest.fn((value: DeepPartial<PasswordResetRequest>) =>
      Object.assign(new PasswordResetRequest(), value),
    ),
    save: jest.fn((request: PasswordResetRequest) => {
      if (!requests.includes(request)) {
        request.createdAt = new Date();
        requests.push(request);
      }
      request.updatedAt = new Date();
      return Promise.resolve(request);
    }),
    update: jest.fn((id: string, values: Partial<PasswordResetRequest>) => {
      const request = requests.find((candidate) => candidate.id === id);
      if (request) Object.assign(request, values);
      return Promise.resolve({ affected: request ? 1 : 0 });
    }),
    createQueryBuilder: jest.fn((alias?: string) =>
      alias === 'request' ? resetSelectBuilder() : resetUpdateBuilder(),
    ),
  } as unknown as Repository<PasswordResetRequest>;

  const userRepository = {
    findOne: jest.fn((options: { where: { email: string } }) =>
      Promise.resolve(options.where.email === user.email ? user : null),
    ),
    createQueryBuilder: jest.fn(() => {
      let userId = 0;
      const builder: Record<string, jest.Mock> = {};
      builder.addSelect = jest.fn().mockReturnValue(builder);
      builder.setLock = jest.fn().mockReturnValue(builder);
      builder.where = jest.fn(
        (_query: string, parameters: { userId: number }) => {
          userId = parameters.userId;
          return builder;
        },
      );
      builder.getOne = jest.fn(() =>
        Promise.resolve(userId === user.id ? user : null),
      );
      return builder;
    }),
    save: jest.fn((value: User) => Promise.resolve(value)),
  } as unknown as Repository<User>;

  const refreshRepository = {
    createQueryBuilder: jest.fn(() => {
      let userId = 0;
      let values: Partial<AuthRefreshSession> = {};
      const builder: Record<string, jest.Mock> = {};
      builder.update = jest.fn().mockReturnValue(builder);
      builder.set = jest.fn((next: Partial<AuthRefreshSession>) => {
        values = next;
        return builder;
      });
      builder.where = jest.fn(
        (_query: string, parameters: { userId: number }) => {
          userId = parameters.userId;
          return builder;
        },
      );
      builder.andWhere = jest.fn().mockReturnValue(builder);
      builder.execute = jest.fn(() => {
        const matches = sessions.filter(
          (session) => session.userId === userId && !session.revokedAt,
        );
        matches.forEach((session) => Object.assign(session, values));
        return Promise.resolve({ affected: matches.length });
      });
      return builder;
    }),
  } as unknown as Repository<AuthRefreshSession>;

  const manager = {
    query: jest.fn().mockResolvedValue([]),
    getRepository: jest.fn((entity: unknown) => {
      if (entity === PasswordResetRequest) return resetRepository;
      if (entity === User) return userRepository;
      return refreshRepository;
    }),
  } as unknown as EntityManager;
  Object.assign(resetRepository, {
    manager: {
      transaction: <T>(
        callback: (entityManager: EntityManager) => Promise<T>,
      ) => callback(manager),
    },
  });

  const service = new PasswordResetService(
    resetRepository,
    mail as unknown as MailService,
    new ConfigService({
      PASSWORD_RESET_SECRET: 'password-reset-test-secret-at-least-32-chars',
    }),
  );
  return {
    service,
    requests,
    sessions,
    user,
    mail,
    lastCode: () => deliveredCode,
  };
};

describe('PasswordResetService', () => {
  it('completes a reset, consumes the token, and revokes sessions', async () => {
    const harness = createHarness();
    await expect(
      harness.service.requestReset(harness.user.email, '203.0.113.10'),
    ).resolves.toEqual({
      message:
        'Si un compte correspond à cette adresse, un code de vérification a été envoyé.',
    });
    expect(harness.lastCode()).toMatch(/^\d{6}$/);
    expect(harness.requests[0].codeHash).not.toBe(harness.lastCode());

    const verification = await harness.service.verifyCode(
      harness.user.email,
      harness.lastCode(),
    );
    const currentRequest = harness.requests[0];
    expect(currentRequest.resetTokenHash).not.toBe(verification.resetToken);
    harness.requests.push(
      Object.assign(new PasswordResetRequest(), {
        ...currentRequest,
        id: 'outstanding-request',
        codeHash: 'b'.repeat(64),
        resetTokenHash: null,
        verifiedAt: null,
        usedAt: null,
        revokedAt: null,
        createdAt: new Date(),
      }),
    );

    await expect(
      harness.service.resetPassword(
        verification.resetToken,
        'NewSecurePassword123!',
      ),
    ).resolves.toEqual({
      success: true,
      message: 'Votre mot de passe a été réinitialisé.',
    });

    expect(
      await bcrypt.compare('NewSecurePassword123!', harness.user.password),
    ).toBe(true);
    expect(harness.user.authVersion).toBe(1);
    expect(harness.sessions[0].revokedAt).toBeInstanceOf(Date);
    expect(harness.requests[0].usedAt).toBeInstanceOf(Date);
    expect(harness.requests[1].revokedAt).toBeInstanceOf(Date);
    expect(harness.mail.sendPasswordChangedConfirmation).toHaveBeenCalledWith(
      harness.user.email,
    );
    await expect(
      harness.service.resetPassword(
        verification.resetToken,
        'AnotherSecurePassword123!',
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects invalid codes and revokes the request after five attempts', async () => {
    const harness = createHarness();
    await harness.service.requestReset(harness.user.email, '203.0.113.11');
    const invalidCode = harness.lastCode() === '000000' ? '000001' : '000000';

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(
        harness.service.verifyCode(harness.user.email, invalidCode),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    }

    expect(harness.requests[0].verificationAttempts).toBe(5);
    expect(harness.requests[0].revokedAt).toBeInstanceOf(Date);
    expect(harness.requests[0].codeHash).toBeNull();
  });

  it('rejects an expired verification code', async () => {
    const harness = createHarness();
    await harness.service.requestReset(harness.user.email, '203.0.113.12');
    harness.requests[0].codeExpiresAt = new Date(Date.now() - 1);

    await expect(
      harness.service.verifyCode(harness.user.email, harness.lastCode()),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(harness.requests[0].revokedAt).toBeInstanceOf(Date);
  });

  it('enforces the 60-second resend cooldown with the generic response', async () => {
    const harness = createHarness();
    const first = await harness.service.requestReset(
      harness.user.email,
      '203.0.113.13',
    );
    const second = await harness.service.requestReset(
      harness.user.email,
      '203.0.113.13',
    );

    expect(second).toEqual(first);
    expect(harness.requests).toHaveLength(1);
    expect(harness.mail.sendPasswordResetCode).toHaveBeenCalledTimes(1);
  });

  it('revokes the previous code when a new code is issued', async () => {
    const harness = createHarness();
    await harness.service.requestReset(harness.user.email, '203.0.113.16');
    const previousRequest = harness.requests[0];
    previousRequest.createdAt = new Date(Date.now() - 61_000);

    await harness.service.requestReset(harness.user.email, '203.0.113.16');

    expect(harness.requests).toHaveLength(2);
    expect(previousRequest.revokedAt).toBeInstanceOf(Date);
    expect(previousRequest.codeHash).toBeNull();
    expect(harness.mail.sendPasswordResetCode).toHaveBeenCalledTimes(2);
  });

  it('rate-limits an email after five requests in one hour', async () => {
    const harness = createHarness();
    for (let request = 0; request < 6; request += 1) {
      await harness.service.requestReset(
        harness.user.email,
        `203.0.113.${20 + request}`,
      );
      const latest = harness.requests.at(-1);
      if (latest) latest.createdAt = new Date(Date.now() - 61_000);
    }

    expect(harness.requests).toHaveLength(5);
    expect(harness.mail.sendPasswordResetCode).toHaveBeenCalledTimes(5);
  });

  it('rate-limits an IP after twenty requests in one hour', async () => {
    const harness = createHarness();
    for (let request = 0; request < 21; request += 1) {
      await harness.service.requestReset(
        `missing-${request}@example.com`,
        '203.0.113.99',
      );
    }

    expect(harness.requests).toHaveLength(20);
    expect(harness.mail.sendPasswordResetCode).not.toHaveBeenCalled();
  });

  it('rejects an expired reset token', async () => {
    const harness = createHarness();
    await harness.service.requestReset(harness.user.email, '203.0.113.14');
    const verification = await harness.service.verifyCode(
      harness.user.email,
      harness.lastCode(),
    );
    harness.requests[0].resetTokenExpiresAt = new Date(Date.now() - 1);

    await expect(
      harness.service.resetPassword(
        verification.resetToken,
        'NewSecurePassword123!',
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns the same forgot-password response for an unknown email', async () => {
    const harness = createHarness();
    await expect(
      harness.service.requestReset('missing@example.com', '203.0.113.15'),
    ).resolves.toEqual({
      message:
        'Si un compte correspond à cette adresse, un code de vérification a été envoyé.',
    });
    expect(harness.mail.sendPasswordResetCode).not.toHaveBeenCalled();
    expect(harness.requests[0].userId).toBeNull();
  });
});
