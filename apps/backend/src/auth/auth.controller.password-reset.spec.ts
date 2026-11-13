import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'http';
import request from 'supertest';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';

describe('AuthController password reset endpoints', () => {
  let app: INestApplication;
  const passwordResetService = {
    requestReset: jest.fn().mockResolvedValue({
      message:
        'Si un compte correspond à cette adresse, un code de vérification a été envoyé.',
    }),
    verifyCode: jest.fn().mockResolvedValue({
      resetToken: 'bspr_test-token-that-is-long-enough-for-validation',
      resetTokenExpiresAt: '2026-11-13T12:10:00.000Z',
    }),
    resetPassword: jest.fn().mockResolvedValue({
      success: true,
      message: 'Votre mot de passe a été réinitialisé.',
    }),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: {} },
        { provide: UsersService, useValue: {} },
        { provide: PasswordResetService, useValue: passwordResetService },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterAll(async () => app.close());

  beforeEach(() => jest.clearAllMocks());

  const server = () => app.getHttpServer() as Server;

  it('accepts a forgot-password request and normalizes the email', async () => {
    await request(server())
      .post('/auth/forgot-password')
      .send({ email: '  USER@Example.com  ' })
      .expect(200)
      .expect({
        message:
          'Si un compte correspond à cette adresse, un code de vérification a été envoyé.',
      });

    expect(passwordResetService.requestReset).toHaveBeenCalledWith(
      'user@example.com',
      expect.any(String),
    );
  });

  it('rejects an invalid forgot-password email', async () => {
    await request(server())
      .post('/auth/forgot-password')
      .send({ email: 'not-an-email' })
      .expect(400);
  });

  it('verifies a six-digit code', async () => {
    await request(server())
      .post('/auth/verify-reset-code')
      .send({ email: 'user@example.com', code: '582941' })
      .expect(200)
      .expect({
        resetToken: 'bspr_test-token-that-is-long-enough-for-validation',
        resetTokenExpiresAt: '2026-11-13T12:10:00.000Z',
      });
  });

  it('rejects a malformed verification code', async () => {
    await request(server())
      .post('/auth/verify-reset-code')
      .send({ email: 'user@example.com', code: '12345' })
      .expect(400);
  });

  it('accepts a valid reset token and password', async () => {
    await request(server())
      .post('/auth/reset-password')
      .send({
        resetToken: 'bspr_test-token-that-is-long-enough-for-validation',
        newPassword: 'NewSecurePassword123!',
      })
      .expect(200)
      .expect({
        success: true,
        message: 'Votre mot de passe a été réinitialisé.',
      });
  });
});
