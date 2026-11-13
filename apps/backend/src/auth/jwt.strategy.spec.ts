import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy auth version', () => {
  const previousSecret = process.env.JWT_SECRET;

  afterAll(() => {
    process.env.JWT_SECRET = previousSecret;
  });

  it('accepts the current auth version', async () => {
    process.env.JWT_SECRET = 'jwt-strategy-test-secret';
    const usersService = {
      findAuthById: jest.fn().mockResolvedValue({ authVersion: 2 }),
    } as unknown as UsersService;
    const strategy = new JwtStrategy(usersService);

    await expect(
      strategy.validate({
        sub: 7,
        username: 'user@example.com',
        role: UserRole.CLIENT,
        ver: 2,
      }),
    ).resolves.toEqual({
      userId: 7,
      email: 'user@example.com',
      role: UserRole.CLIENT,
    });
  });

  it('rejects an access token issued before a password reset', async () => {
    process.env.JWT_SECRET = 'jwt-strategy-test-secret';
    const usersService = {
      findAuthById: jest.fn().mockResolvedValue({ authVersion: 2 }),
    } as unknown as UsersService;
    const strategy = new JwtStrategy(usersService);

    await expect(
      strategy.validate({
        sub: 7,
        username: 'user@example.com',
        role: UserRole.CLIENT,
        ver: 1,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('keeps pre-version tokens valid until the first password reset', async () => {
    process.env.JWT_SECRET = 'jwt-strategy-test-secret';
    const usersService = {
      findAuthById: jest.fn().mockResolvedValue({ authVersion: 0 }),
    } as unknown as UsersService;
    const strategy = new JwtStrategy(usersService);

    await expect(
      strategy.validate({
        sub: 7,
        username: 'user@example.com',
        role: UserRole.CLIENT,
      }),
    ).resolves.toMatchObject({ userId: 7 });
  });
});
