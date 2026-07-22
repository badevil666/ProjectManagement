import type { BrevoConfig } from '../../config/env';
import type { EmailMessage, EmailSender } from './emailSender';

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

/**
 * Sends transactional email via Brevo's HTTP API over HTTPS (port 443). Unlike
 * SMTP, this is not blocked/throttled by cloud hosts, so it's the reliable
 * transport in production. The sender email must be a Brevo-verified sender.
 */
export class BrevoEmailSender implements EmailSender {
  constructor(private readonly config: BrevoConfig) {}

  async send(message: EmailMessage): Promise<void> {
    const response = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': this.config.apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { email: this.config.senderEmail, name: this.config.senderName },
        to: [{ email: message.to }],
        subject: message.subject,
        htmlContent: message.html,
        textContent: message.text,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Brevo API responded ${response.status}: ${body.slice(0, 300)}`);
    }
  }
}
