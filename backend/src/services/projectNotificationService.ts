import type { NotificationType } from '@prisma/client';
import type { IProjectRepository } from '../repositories/projectRepository';
import { NotFoundError, ValidationError } from '../utils/AppError';
import type { NotificationService } from './notificationService';
import type { ProgressService } from './progressService';
import {
  featureCompletedTemplate,
  moduleCompletedTemplate,
  projectCompletedTemplate,
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

  async sendCompletionEmail(
    projectId: string,
    input: SendCompletionInput,
  ): Promise<SendCompletionResult> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    // Recipients must be among the client's known email addresses — you can
    // only send to people already on the client record.
    const allowed = new Set([project.client.email, ...project.client.additionalEmails]);
    const invalid = input.recipients.filter((email) => !allowed.has(email));
    if (invalid.length > 0) {
      throw new ValidationError("Recipients must be one of the client's email addresses", {
        invalid,
      });
    }

    const progress = this.progressService.buildProgressSnapshot(project.modules);

    let content: EmailContent;
    let type: NotificationType;

    if (input.kind === 'MODULE') {
      const module = project.modules.find((m) => m.id === input.moduleId);
      if (!module) throw new NotFoundError('Module not found in this project');
      content = moduleCompletedTemplate({
        projectTitle: project.title,
        moduleTitle: module.title,
        progress,
      });
      type = 'MODULE_COMPLETED';
    } else if (input.kind === 'FEATURE') {
      let featureTitle: string | undefined;
      let moduleTitle: string | undefined;
      for (const module of project.modules) {
        const feature = module.features.find((f) => f.id === input.featureId);
        if (feature) {
          featureTitle = feature.title;
          moduleTitle = module.title;
          break;
        }
      }
      if (!featureTitle || !moduleTitle) {
        throw new NotFoundError('Feature not found in this project');
      }
      content = featureCompletedTemplate({
        projectTitle: project.title,
        moduleTitle,
        featureTitle,
        progress,
      });
      type = 'FEATURE_COMPLETED';
    } else {
      content = projectCompletedTemplate({ projectTitle: project.title, progress });
      type = 'PROJECT_COMPLETED';
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
