import { ConfigService } from '@nestjs/config';
import nodemailer, { SendMailOptions } from 'nodemailer';
import { MailService } from './mail.service';

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: { createTransport: jest.fn() },
}));

const mailConfig = () =>
  new ConfigService({
    MAIL_HOST: 'smtp.gmail.com',
    MAIL_PORT: '465',
    MAIL_SECURE: 'true',
    MAIL_USER: 'mailer@example.com',
    MAIL_PASSWORD: 'app-password',
    MAIL_FROM_NAME: 'BeautySafe',
  });

describe('MailService', () => {
  const sendMail = jest
    .fn<Promise<{ messageId: string }>, [SendMailOptions]>()
    .mockResolvedValue({ messageId: 'test' });
  const verify = jest.fn().mockResolvedValue(true);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(nodemailer.createTransport).mockReturnValue({
      sendMail,
      verify,
    } as never);
  });

  it('uses secure Gmail SMTP and renders the French reset email', async () => {
    const service = new MailService(mailConfig());
    await service.sendPasswordResetCode('user@example.com', '582941');

    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'mailer@example.com',
          pass: 'app-password',
        },
      }),
    );
    expect(sendMail).toHaveBeenCalledTimes(1);
    const message = sendMail.mock.calls[0][0];
    expect(message.to).toBe('user@example.com');
    expect(message.subject).toBe(
      'BeautySafe : Réinitialisation de votre mot de passe',
    );
    expect(message.text).toContain('582941');
    expect(message.html).toContain('582941');
  });

  it('verifies SMTP connectivity without sending an email', async () => {
    const service = new MailService(mailConfig());
    await expect(service.verifyConnection()).resolves.toBe(true);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('rejects non-TLS or non-465 mail configuration', () => {
    expect(
      () =>
        new MailService(
          new ConfigService({
            MAIL_HOST: 'smtp.gmail.com',
            MAIL_PORT: '587',
            MAIL_SECURE: 'false',
            MAIL_USER: 'mailer@example.com',
            MAIL_PASSWORD: 'app-password',
            MAIL_FROM_NAME: 'BeautySafe',
          }),
        ),
    ).toThrow('Gmail SMTP must use MAIL_PORT=465 and MAIL_SECURE=true');
  });
});
