import type { ProjectPriority, ProjectStatus } from '@prisma/client';
import type { IClientRepository } from '../repositories/clientRepository';
import type { ICommentRepository } from '../repositories/commentRepository';
import type { IFileRepository } from '../repositories/fileRepository';
import type { IProjectRepository, ProjectUpdateData } from '../repositories/projectRepository';
import { NotFoundError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { buildMeta, parsePagination } from '../utils/pagination';
import type { ActivityService } from './activityService';
import type { NotificationService } from './notificationService';
import type { ProgressService } from './progressService';
import {
  serializeProjectDetailForAdmin,
  serializeProjectDetailForShare,
  serializeProjectListItem,
} from './serializers/projectSerializer';
import type { StorageService } from './storage/StorageService';

export interface ProjectMutationInput {
  clientId?: string;
  title?: string;
  description?: string | null;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: string | null;
  expectedEndDate?: string | null;
  actualEndDate?: string | null;
  budget?: string | null;
  currency?: string;
}

function toDate(value: string | null | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return new Date(value);
}

export class ProjectService {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly clientRepository: IClientRepository,
    private readonly fileRepository: IFileRepository,
    private readonly commentRepository: ICommentRepository,
    private readonly storageService: StorageService,
    private readonly activityService: ActivityService,
    private readonly notificationService: NotificationService,
    private readonly progressService: ProgressService,
  ) {}

  async list(query: {
    page?: unknown;
    limit?: unknown;
    status?: ProjectStatus;
    clientId?: string;
    search?: string;
  }) {
    const { page, limit, skip, take } = parsePagination(query);
    const filters = {
      status: query.status,
      clientId: query.clientId,
      search: query.search?.trim() || undefined,
    };

    const [items, total] = await Promise.all([
      this.projectRepository.findManyWithFilters({ skip, take, ...filters }),
      this.projectRepository.count(filters),
    ]);

    return {
      data: items.map(serializeProjectListItem),
      meta: buildMeta(page, limit, total),
    };
  }

  async getById(id: string) {
    const project = await this.projectRepository.findById(id);
    if (!project) throw new NotFoundError('Project not found');

    const freshProgress = this.progressService.computeOverallProgress(project.modules);
    if (freshProgress !== project.overallProgress) {
      await this.projectRepository.updateProgress(id, freshProgress);
      project.overallProgress = freshProgress;
    }

    return serializeProjectDetailForAdmin(project, this.progressService);
  }

  async create(
    data: Required<Pick<ProjectMutationInput, 'clientId' | 'title'>> & ProjectMutationInput,
    createdBy: string,
  ) {
    const client = await this.clientRepository.findById(data.clientId);
    if (!client) throw new NotFoundError('Client not found');

    const project = await this.projectRepository.create({
      clientId: data.clientId,
      title: data.title,
      description: data.description ?? null,
      status: data.status,
      priority: data.priority,
      startDate: toDate(data.startDate) ?? null,
      expectedEndDate: toDate(data.expectedEndDate) ?? null,
      budget: data.budget ?? null,
      currency: data.currency,
      createdBy,
    });

    await this.activityService.log(
      project.id,
      'PROJECT_CREATED',
      `Project "${project.title}" was created`,
      createdBy,
    );

    return serializeProjectDetailForAdmin(project, this.progressService);
  }

  async update(id: string, data: ProjectMutationInput, actorId: string) {
    const existing = await this.projectRepository.findById(id);
    if (!existing) throw new NotFoundError('Project not found');

    if (data.clientId && data.clientId !== existing.clientId) {
      const client = await this.clientRepository.findById(data.clientId);
      if (!client) throw new NotFoundError('Client not found');
    }

    const updateData: ProjectUpdateData = {
      clientId: data.clientId,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      startDate: toDate(data.startDate),
      expectedEndDate: toDate(data.expectedEndDate),
      budget: data.budget,
      currency: data.currency,
    };

    const isCompletingNow = data.status === 'COMPLETED' && existing.status !== 'COMPLETED';
    if (isCompletingNow) {
      updateData.actualEndDate = toDate(data.actualEndDate) ?? existing.actualEndDate ?? new Date();
    } else if (data.actualEndDate !== undefined) {
      updateData.actualEndDate = toDate(data.actualEndDate);
    }

    const updated = await this.projectRepository.update(id, updateData);

    if (data.status && data.status !== existing.status) {
      await this.activityService.log(
        id,
        'PROJECT_STATUS_CHANGED',
        `Project status changed from ${existing.status} to ${data.status}`,
        actorId,
      );
    }

    if (isCompletingNow) {
      await this.notificationService.notifyProjectCompleted({
        projectId: id,
        recipientEmail: updated.client.email,
        projectTitle: updated.title,
        progress: this.progressService.buildProgressSnapshot(updated.modules),
      });
    }

    return serializeProjectDetailForAdmin(updated, this.progressService);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.projectRepository.findById(id);
    if (!existing) throw new NotFoundError('Project not found');

    const files = await this.fileRepository.listByProject(id);
    for (const file of files) {
      try {
        await this.storageService.delete(file.storageKey);
      } catch (error) {
        logger.error(`Failed to delete storage object for file ${file.id}`, error);
      }
    }

    await this.projectRepository.delete(id);
  }

  async getTimeline(id: string) {
    const exists = await this.projectRepository.exists(id);
    if (!exists) throw new NotFoundError('Project not found');
    return this.activityService.listForProject(id);
  }

  /** Public share-link project detail (client, modules+features, files, comments, timeline). */
  async getDetailForShare(id: string, token: string) {
    const project = await this.projectRepository.findById(id);
    if (!project) throw new NotFoundError('Project not found');

    const freshProgress = this.progressService.computeOverallProgress(project.modules);
    if (freshProgress !== project.overallProgress) {
      await this.projectRepository.updateProgress(id, freshProgress);
      project.overallProgress = freshProgress;
    }

    const [comments, timeline] = await Promise.all([
      this.commentRepository.listByProject(id),
      this.activityService.listForProject(id),
    ]);

    return serializeProjectDetailForShare(project, this.progressService, token, comments, timeline);
  }
}
