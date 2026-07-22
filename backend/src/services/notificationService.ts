import type { NotificationType } from '@prisma/client';
import type {
  INotificationRepository,
  NotificationStatusUpdate,
} from '../repositories/notificationRepository';
import { logger } from '../utils/logger';
import type { EmailSender } from './email/emailSender';
import { commentAddedTemplate, type EmailContent } from './notifications/templates';

interface DispatchParams {
  projectId: string;
  recipientEmail: string;
  type: NotificationType;
  subject: string;
  html: string;
  text: string;
}

/**
 * Low-level email sender. Every send first creates a `Notification` row
 * (`PENDING`), then updates it to `SENT`/`FAILED`. Guaranteed to never throw —
 * a failed or skipped (no SMTP configured) send is caught and logged.
 *
 * Completion emails are NOT sent from here automatically anymore; the admin
 * triggers them explicitly (see ProjectNotificationService), which builds the
 * email content and calls `sendToRecipients`.
 */
export class NotificationService {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly emailSender: EmailSender | null,
  ) {}

  /** Auto-sent to the client when an admin posts a comment. */
  async notifyCommentAdded(params: {
    projectId: string;
    recipientEmail: string;
    projectTitle: string;
    authorName: string;
    message: string;
  }): Promise<void> {
    const { subject, html, text } = commentAddedTemplate({
      projectTitle: params.projectTitle,
      authorName: params.authorName,
      message: params.message,
    });
    await this.dispatch({
      projectId: params.projectId,
      recipientEmail: params.recipientEmail,
      type: 'COMMENT_ADDED',
      subject,
      html,
      text,
    });
  }

  /**
   * Sends a pre-built email to multiple recipients, recording one Notification
   * row per recipient. Never throws; returns per-batch sent/failed counts.
   */
  async sendToRecipients(params: {
    projectId: string;
    recipients: string[];
    type: NotificationType;
    content: EmailContent;
  }): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;
    for (const recipientEmail of params.recipients) {
      const ok = await this.dispatch({
        projectId: params.projectId,
        recipientEmail,
        type: params.type,
        subject: params.content.subject,
        html: params.content.html,
        text: params.content.text,
      });
      if (ok) sent += 1;
      else failed += 1;
    }
    return { sent, failed };
  }

  /** Core send pipeline. Never rejects; returns true only when actually sent. */
  private async dispatch(params: DispatchParams): Promise<boolean> {
    try {
      const notification = await this.notificationRepository.create({
        projectId: params.projectId,
        recipientEmail: params.recipientEmail,
        type: params.type,
        message: params.text,
      });

      if (!this.emailSender) {
        logger.warn(
          `No email transport configured — skipping ${params.type} email to ${params.recipientEmail}.`,
        );
        await this.safeUpdateStatus(notification.id, {
          status: 'FAILED',
          errorMessage: 'Email transport not configured; email not sent.',
        });
        return false;
      }

      try {
        await this.emailSender.send({
          to: params.recipientEmail,
          subject: params.subject,
          html: params.html,
          text: params.text,
        });
        await this.safeUpdateStatus(notification.id, { status: 'SENT', sentAt: new Date() });
        return true;
      } catch (sendError) {
        logger.error(`Failed to send ${params.type} email to ${params.recipientEmail}`, sendError);
        await this.safeUpdateStatus(notification.id, {
          status: 'FAILED',
          errorMessage:
            sendError instanceof Error ? sendError.message : 'Unknown error sending email',
        });
        return false;
      }
    } catch (error) {
      // Even notification-row bookkeeping failures must never bubble up.
      logger.error(`Notification dispatch failed entirely for ${params.type}`, error);
      return false;
    }
  }

  private async safeUpdateStatus(id: string, data: NotificationStatusUpdate): Promise<void> {
    try {
      await this.notificationRepository.updateStatus(id, data);
    } catch (error) {
      logger.error(`Failed to update notification status for notification ${id}`, error);
    }
  }
}
