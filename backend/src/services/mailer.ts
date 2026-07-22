import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { EmailSender } from './email/emailSender';
import { BrevoEmailSender } from './email/brevoEmailSender';
import { SmtpEmailSender } from './email/smtpEmailSender';

/**
 * Chooses the outbound email transport:
 *   1. Brevo HTTP API (BREVO_API_KEY + BREVO_SENDER_EMAIL) — preferred, since
 *      it sends over HTTPS and isn't blocked/throttled like SMTP ports.
 *   2. SMTP (all SMTP_* vars) — fallback.
 *   3. null — no transport configured; callers log-and-skip.
 */
export function createEmailSender(): EmailSender | null {
  if (env.brevo) {
    logger.info('Email transport: Brevo HTTP API');
    return new BrevoEmailSender(env.brevo);
  }

  if (env.smtp) {
    logger.info('Email transport: SMTP');
    const transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
      // Reuse one authenticated connection and fail fast instead of hanging
      // when the SMTP host is slow/unreachable.
      pool: true,
      maxConnections: 2,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
    return new SmtpEmailSender(transporter, env.smtp.from);
  }

  logger.warn('No email transport configured — outbound email notifications are disabled.');
  return null;
}
