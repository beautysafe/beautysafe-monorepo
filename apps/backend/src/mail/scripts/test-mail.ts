import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail.service';

async function testMail(): Promise<void> {
  const recipient = process.env.MAIL_TEST_TO;
  if (!recipient) {
    throw new Error('MAIL_TEST_TO is required');
  }

  const mail = new MailService(new ConfigService());
  await mail.verifyConnection();
  console.log('SMTP connection verified');
  await mail.sendTestEmail(recipient);
  console.log('Test email sent');
}

void testMail().catch(() => {
  console.error(
    'SMTP test failed. Check the mail environment variables and Gmail App Password.',
  );
  process.exitCode = 1;
});
