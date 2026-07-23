import type { NotificationType } from '@prisma/client';
import type { IProjectRepository } from '../repositories/projectRepository';
import { NotFoundError, ValidationError } from '../utils/AppError';
import type { NotificationService } from './notificationService';
import type { ProgressService } from './progressService';
import {
  featureUpdateTemplate,
  moduleUpdateTemplate,
  projectUpdateTemplate,
  type EmailContent,
} from './notifications/templates';

export type CompletionEmailKind = 'MODULE' | 'FEATURE' | 'PROJECT';

export interface SendCompletionInput {
  kind: CompletionEmailKind;
  moduleId?: string;
  featureId?: string;
  recipients: string[];
}

export interface SendCompletionResult {
  sent: number;
  failed: number;
  recipients: string[];
}

export interface BuildEmailInput {
  kind: CompletionEmailKind;
  moduleId?: string;
  featureId?: string;
}

export interface EmailPreview {
  subject: string;
  html: string;
  text: string;
}

/**
 * Builds and sends a project-update email on explicit admin request, to a
 * chosen subset of the client's email addresses. This replaces the previous
 * automatic-on-completion emails: the admin now decides WHEN to send and WHO
 * receives it.
 */
export class ProjectNotificationService {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly notificationService: NotificationService,
    private readonly progressService: ProgressService,
  ) {}

  /**
   * Builds the email content (subject/html/text) for the given target without
   * sending it. Shared by the preview endpoint and the send path.
   */
  private async buildEmail(
    projectId: string,
    input: BuildEmailInput,
  ): Promise<{ content: EmailContent; type: NotificationType; recipientPool: string[] }> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    const progress = this.progressService.buildProgressSnapshot(project.modules);
    const recipientPool = [project.client.email, ...project.client.additionalEmails];

    let content: EmailContent;
    let type: NotificationType;

    if (input.kind === 'MODULE') {
      const module = project.modules.find((m) => m.id === input.moduleId);
      if (!module) throw new NotFoundError('Module not found in this project');
      content = moduleUpdateTemplate({
        projectTitle: project.title,
        moduleTitle: module.title,
        status: module.status,
        progress,
      });
      type = 'MODULE_COMPLETED';
    } else if (input.kind === 'FEATURE') {
      const found = project.modules
        .flatMap((module) => module.features.map((feature) => ({ module, feature })))
        .find((entry) => entry.feature.id === input.featureId);
      if (!found) throw new NotFoundError('Feature not found in this project');
      content = featureUpdateTemplate({
        projectTitle: project.title,
        moduleTitle: found.module.title,
        featureTitle: found.feature.title,
        status: found.feature.status,
        progress,
      });
      type = 'FEATURE_COMPLETED';
    } else {
      content = projectUpdateTemplate({
        projectTitle: project.title,
        status: project.status,
        progress,
      });
      type = 'PROJECT_COMPLETED';
    }

    return { content, type, recipientPool };
  }

  /** Renders the exact email that would be sent, for an in-app preview. */
  async previewEmail(projectId: string, input: BuildEmailInput): Promise<EmailPreview> {
    const { content } = await this.buildEmail(projectId, input);
    return { subject: content.subject, html: content.html, text: content.text };
  }

  async sendCompletionEmail(
    projectId: string,
    input: SendCompletionInput,
  ): Promise<SendCompletionResult> {
    const { content, type, recipientPool } = await this.buildEmail(projectId, input);

    // Recipients must be among the client's known email addresses — you can
    // only send to people already on the client record.
    const allowed = new Set(recipientPool);
    const invalid = input.recipients.filter((email) => !allowed.has(email));
    if (invalid.length > 0) {
      throw new ValidationError("Recipients must be one of the client's email addresses", {
        invalid,
      });
    }

    const { sent, failed } = await this.notificationService.sendToRecipients({
      projectId,
      recipients: input.recipients,
      type,
      content,
    });

    return { sent, failed, recipients: input.recipients };
  }
}
