import type { NotificationType } from '@prisma/client';
import type { Transporter } from 'nodemailer';
import type { ProjectProgressSnapshot } from './progressService';
import type {
  INotificationRepository,
  NotificationStatusUpdate,
} from '../repositories/notificationRepository';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import {
  commentAddedTemplate,
  featureCompletedTemplate,
  moduleCompletedTemplate,
  projectCompletedTemplate,
} from './notifications/templates';

interface DispatchParams {
  projectId: string;
  recipientEmail: string;
  type: NotificationType;
  subject: string;
  html: string;
  text: string;
}

/**
 * Wraps Nodemailer with HTML email templates. Every send first creates a
 * `Notification` row (`PENDING`), then updates it to `SENT`/`FAILED`.
 * Guaranteed to never throw — a failed or skipped (no SMTP configured) send
 * is caught and logged, never propagated into the request path.
 */
export class NotificationService {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly transporter: Transporter | null,
  ) {}

  async notifyModuleCompleted(params: {
    projectId: string;
    recipientEmail: string;
    projectTitle: string;
    moduleTitle: string;
    progress: ProjectProgressSnapshot;
  }): Promise<void> {
    const { subject, html, text } = moduleCompletedTemplate({
      projectTitle: params.projectTitle,
      moduleTitle: params.moduleTitle,
      progress: params.progress,
    });
    await this.dispatch({
      projectId: params.projectId,
      recipientEmail: params.recipientEmail,
      type: 'MODULE_COMPLETED',
      subject,
      html,
      text,
    });
  }

  async notifyFeatureCompleted(params: {
    projectId: string;
    recipientEmail: string;
    projectTitle: string;
    moduleTitle: string;
    featureTitle: string;
    progress: ProjectProgressSnapshot;
  }): Promise<void> {
    const { subject, html, text } = featureCompletedTemplate({
      projectTitle: params.projectTitle,
      moduleTitle: params.moduleTitle,
      featureTitle: params.featureTitle,
      progress: params.progress,
    });
    await this.dispatch({
      projectId: params.projectId,
      recipientEmail: params.recipientEmail,
      type: 'FEATURE_COMPLETED',
      subject,
      html,
      text,
    });
  }

  async notifyProjectCompleted(params: {
    projectId: string;
    recipientEmail: string;
    projectTitle: string;
    progress: ProjectProgressSnapshot;
  }): Promise<void> {
    const { subject, html, text } = projectCompletedTemplate({
      projectTitle: params.projectTitle,
      progress: params.progress,
    });
    await this.dispatch({
      projectId: params.projectId,
      recipientEmail: params.recipientEmail,
      type: 'PROJECT_COMPLETED',
      subject,
      html,
      text,
    });
  }

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
   * Core send pipeline. Every branch is wrapped so this method can never
   * reject — callers may `await` it directly without try/catch.
   */
  private async dispatch(params: DispatchParams): Promise<void> {
    try {
      const notification = await this.notificationRepository.create({
        projectId: params.projectId,
        recipientEmail: params.recipientEmail,
        type: params.type,
        message: params.text,
      });

      if (!this.transporter || !env.smtp) {
        logger.warn(
          `SMTP not configured — skipping ${params.type} email to ${params.recipientEmail} (dev mode).`,
        );
        await this.safeUpdateStatus(notification.id, {
          status: 'FAILED',
          errorMessage: 'SMTP not configured; email not sent (dev mode).',
        });
        return;
      }

      try {
        await this.transporter.sendMail({
          from: env.smtp.from,
          to: params.recipientEmail,
          subject: params.subject,
          html: params.html,
          text: params.text,
        });
        await this.safeUpdateStatus(notification.id, { status: 'SENT', sentAt: new Date() });
      } catch (sendError) {
        logger.error(`Failed to send ${params.type} email to ${params.recipientEmail}`, sendError);
        await this.safeUpdateStatus(notification.id, {
          status: 'FAILED',
          errorMessage:
            sendError instanceof Error ? sendError.message : 'Unknown error sending email',
        });
      }
    } catch (error) {
      // Even notification-row bookkeeping failures must never bubble into
      // the request path.
      logger.error(`Notification dispatch failed entirely for ${params.type}`, error);
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
