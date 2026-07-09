import type { ICommentRepository } from '../repositories/commentRepository';
import type { IProjectRepository } from '../repositories/projectRepository';
import { NotFoundError } from '../utils/AppError';
import { logger } from '../utils/logger';
import type { ActivityService } from './activityService';
import type { NotificationService } from './notificationService';
import { serializeComment } from './serializers/commentSerializer';

function truncate(text: string, max = 80): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export class CommentService {
  constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly activityService: ActivityService,
    private readonly notificationService: NotificationService,
  ) {}

  async listForProject(projectId: string) {
    const projectExists = await this.projectRepository.exists(projectId);
    if (!projectExists) throw new NotFoundError('Project not found');

    const comments = await this.commentRepository.listByProject(projectId);
    return comments.map(serializeComment);
  }

  /** Admin-authored comment — logs activity AND emails the client (COMMENT_ADDED). */
  async createAdminComment(
    projectId: string,
    message: string,
    authorName: string,
    actorId: string,
  ) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    const comment = await this.commentRepository.create({
      projectId,
      authorType: 'ADMIN',
      authorName,
      message,
    });

    await this.activityService.log(
      projectId,
      'COMMENT_ADDED',
      `${authorName} commented: "${truncate(message)}"`,
      actorId,
    );

    await this.notificationService.notifyCommentAdded({
      projectId,
      recipientEmail: project.client.email,
      projectTitle: project.title,
      authorName,
      message,
    });

    return serializeComment(comment);
  }

  /** Client-authored comment via share link — logs activity only, NO outbound email. */
  async createClientComment(projectId: string, authorName: string, message: string) {
    const projectExists = await this.projectRepository.exists(projectId);
    if (!projectExists) throw new NotFoundError('Project not found');

    const comment = await this.commentRepository.create({
      projectId,
      authorType: 'CLIENT',
      authorName,
      message,
    });

    await this.activityService.log(
      projectId,
      'COMMENT_ADDED',
      `${authorName} (client) commented: "${truncate(message)}"`,
      null,
    );

    logger.info(
      `New client comment on project ${projectId} from "${authorName}" (admin-awareness only, no email sent)`,
    );

    return serializeComment(comment);
  }
}
