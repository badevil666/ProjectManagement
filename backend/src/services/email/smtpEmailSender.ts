import type { Transporter } from 'nodemailer';
import type { EmailMessage, EmailSender } from './emailSender';

/** Sends email over SMTP via a configured Nodemailer transporter. */
export class SmtpEmailSender implements EmailSender {
  constructor(
    private readonly transporter: Transporter,
    private readonly from: string,
  ) {}

  async send(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
  }
}
