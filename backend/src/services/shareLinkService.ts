import type { IProjectRepository } from '../repositories/projectRepository';
import type { IShareLinkRepository } from '../repositories/shareLinkRepository';
import { GoneError, NotFoundError } from '../utils/AppError';
import { generateShareToken } from '../utils/shareToken';
import { shareLinkFrontendPath } from '../utils/urls';
import type { ActivityService } from './activityService';
import { serializeShareLink } from './serializers/shareLinkSerializer';

export interface ResolvedShareLink {
  id: string;
  projectId: string;
  token: string;
}

export class ShareLinkService {
  constructor(
    private readonly shareLinkRepository: IShareLinkRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly activityService: ActivityService,
  ) {}

  async create(projectId: string, expiresAt: Date | null | undefined, actorId: string | null) {
    const projectExists = await this.projectRepository.exists(projectId);
    if (!projectExists) throw new NotFoundError('Project not found');

    const token = generateShareToken();
    const shareLink = await this.shareLinkRepository.create({
      projectId,
      token,
      expiresAt: expiresAt ?? null,
      createdBy: actorId,
    });

    await this.activityService.log(
      projectId,
      'SHARE_LINK_CREATED',
      'A new share link was created',
      actorId,
    );

    return {
      shareLink: serializeShareLink(shareLink),
      url: shareLinkFrontendPath(token),
    };
  }

  async listForProject(projectId: string) {
    const projectExists = await this.projectRepository.exists(projectId);
    if (!projectExists) throw new NotFoundError('Project not found');

    const shareLinks = await this.shareLinkRepository.listByProject(projectId);
    return shareLinks.map(serializeShareLink);
  }

  async revoke(id: string, actorId: string | null) {
    const existing = await this.shareLinkRepository.findById(id);
    if (!existing) throw new NotFoundError('Share link not found');

    const revoked = await this.shareLinkRepository.revoke(id);
    await this.activityService.log(
      existing.projectId,
      'SHARE_LINK_REVOKED',
      'A share link was revoked',
      actorId,
    );

    return serializeShareLink(revoked);
  }

  /**
   * Token → project resolution used by the `resolveShareLink` middleware:
   * 404 if unknown, 410 Gone if revoked/expired, else increments
   * accessCount/lastAccessedAt and returns the linked project id.
   */
  async resolveToken(token: string): Promise<ResolvedShareLink> {
    const shareLink = await this.shareLinkRepository.findByToken(token);
    if (!shareLink) throw new NotFoundError('Share link not found');

    const isExpired = Boolean(shareLink.expiresAt && shareLink.expiresAt < new Date());
    if (shareLink.revoked || isExpired) {
      throw new GoneError(
        shareLink.revoked ? 'This share link has been revoked' : 'This share link has expired',
      );
    }

    await this.shareLinkRepository.registerAccess(shareLink.id);

    return { id: shareLink.id, projectId: shareLink.projectId, token: shareLink.token };
  }
}
