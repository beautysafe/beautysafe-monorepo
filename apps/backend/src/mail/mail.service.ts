import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

const RESET_SUBJECT = 'BeautySafe : Réinitialisation de votre mot de passe';
const CONFIRMATION_SUBJECT = 'BeautySafe : Votre mot de passe a été modifié';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly from: { name: string; address: string };

  constructor(private readonly config: ConfigService) {
    const host = this.config.getOrThrow<string>('MAIL_HOST');
    const port = Number(this.config.getOrThrow<string>('MAIL_PORT'));
    const secure = this.parseBoolean(
      this.config.getOrThrow<string>('MAIL_SECURE'),
    );
    const user = this.config.getOrThrow<string>('MAIL_USER');
    const password = this.config.getOrThrow<string>('MAIL_PASSWORD');
    const fromName = this.config.getOrThrow<string>('MAIL_FROM_NAME');

    if (port !== 465 || !secure) {
      throw new Error('Gmail SMTP must use MAIL_PORT=465 and MAIL_SECURE=true');
    }

    this.from = { name: fromName, address: user };
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass: password },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
      tls: { minVersion: 'TLSv1.2', servername: host },
    });
  }

  verifyConnection(): Promise<true> {
    return this.transporter.verify();
  }

  async sendPasswordResetCode(to: string, code: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: RESET_SUBJECT,
      text: [
        'Bonjour,',
        '',
        'Vous avez demandé la réinitialisation de votre mot de passe BeautySafe.',
        '',
        `Votre code de vérification est : ${code}`,
        '',
        'Ce code est valable pendant 10 minutes.',
        '',
        "Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail.",
        '',
        "L'équipe BeautySafe",
      ].join('\n'),
      html: this.passwordResetTemplate(code),
    });
  }

  async sendPasswordChangedConfirmation(to: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: CONFIRMATION_SUBJECT,
      text: [
        'Bonjour,',
        '',
        'Votre mot de passe BeautySafe vient d’être modifié.',
        '',
        "Si vous n'êtes pas à l'origine de cette modification, contactez immédiatement l'équipe BeautySafe.",
        '',
        "L'équipe BeautySafe",
      ].join('\n'),
      html: this.passwordChangedTemplate(),
    });
  }

  async sendTestEmail(to: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'BeautySafe : Test SMTP',
      text: 'La connexion SMTP BeautySafe fonctionne correctement.',
      html: this.layout(`
        <h1 style="margin:0 0 16px;color:#172554;font-size:24px;">Test SMTP réussi</h1>
        <p style="margin:0;color:#475569;line-height:1.6;">La connexion Gmail SMTP BeautySafe fonctionne correctement.</p>
      `),
    });
  }

  private passwordResetTemplate(code: string): string {
    return this.layout(`
      <h1 style="margin:0 0 18px;color:#172554;font-size:24px;line-height:1.3;">Réinitialisation de votre mot de passe</h1>
      <p style="margin:0 0 14px;color:#475569;line-height:1.7;">Bonjour,</p>
      <p style="margin:0 0 22px;color:#475569;line-height:1.7;">Vous avez demandé la réinitialisation de votre mot de passe BeautySafe.</p>
      <p style="margin:0 0 10px;color:#475569;line-height:1.7;">Votre code de vérification est :</p>
      <div style="margin:0 0 22px;padding:18px 20px;border-radius:12px;background:#eff6ff;border:1px solid #bfdbfe;text-align:center;color:#1d4ed8;font-size:34px;font-weight:700;letter-spacing:9px;">${code}</div>
      <p style="margin:0 0 22px;color:#475569;line-height:1.7;"><strong>Ce code est valable pendant 10 minutes.</strong></p>
      <p style="margin:0 0 22px;color:#64748b;line-height:1.7;">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail.</p>
      <p style="margin:0;color:#475569;line-height:1.7;">L'équipe BeautySafe</p>
    `);
  }

  private passwordChangedTemplate(): string {
    return this.layout(`
      <h1 style="margin:0 0 18px;color:#172554;font-size:24px;line-height:1.3;">Mot de passe modifié</h1>
      <p style="margin:0 0 14px;color:#475569;line-height:1.7;">Bonjour,</p>
      <p style="margin:0 0 22px;color:#475569;line-height:1.7;">Votre mot de passe BeautySafe vient d’être modifié avec succès.</p>
      <p style="margin:0 0 22px;color:#64748b;line-height:1.7;">Si vous n'êtes pas à l'origine de cette modification, contactez immédiatement l'équipe BeautySafe.</p>
      <p style="margin:0;color:#475569;line-height:1.7;">L'équipe BeautySafe</p>
    `);
  }

  private layout(content: string): string {
    return `<!doctype html>
      <html lang="fr">
        <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:32px 12px;">
            <tr><td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,.08);">
                <tr><td style="padding:22px 30px;background:linear-gradient(135deg,#38bdf8,#6366f1);color:#ffffff;font-size:22px;font-weight:700;letter-spacing:.4px;">BeautySafe</td></tr>
                <tr><td style="padding:32px 30px;">${content}</td></tr>
                <tr><td style="padding:18px 30px;background:#f8fafc;color:#94a3b8;font-size:12px;text-align:center;">BeautySafe — Prenez soin de votre beauté en toute confiance.</td></tr>
              </table>
            </td></tr>
          </table>
        </body>
      </html>`;
  }

  private parseBoolean(value: string): boolean {
    return value.trim().toLowerCase() === 'true';
  }
}
