import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Returns a configured Nodemailer transporter, or `null` when SMTP_* env
 * vars are not fully configured — callers must treat `null` as "log and
 * skip" rather than throwing.
 */
export function createMailTransporter(): Transporter | null {
  if (!env.smtp) {
    logger.warn('SMTP is not configured — outbound email notifications are disabled (dev mode).');
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });
}
