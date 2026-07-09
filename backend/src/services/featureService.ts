import type { FeaturePriority, FeatureStatus } from '@prisma/client';
import type { IFeatureRepository } from '../repositories/featureRepository';
import type { IModuleRepository } from '../repositories/moduleRepository';
import type { IProjectRepository, ProjectDetail } from '../repositories/projectRepository';
import { NotFoundError, ValidationError } from '../utils/AppError';
import type { ActivityService } from './activityService';
import type { NotificationService } from './notificationService';
import type { ProgressService } from './progressService';
import { serializeFeature } from './serializers/featureSerializer';

export interface FeatureMutationInput {
  title?: string;
  description?: string | null;
  priority?: FeaturePriority;
  estimatedHours?: string | null;
}

export class FeatureService {
  constructor(
    private readonly featureRepository: IFeatureRepository,
    private readonly moduleRepository: IModuleRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly activityService: ActivityService,
    private readonly notificationService: NotificationService,
    private readonly progressService: ProgressService,
  ) {}

  async create(
    moduleId: string,
    data: Required<Pick<FeatureMutationInput, 'title'>> & FeatureMutationInput,
    actorId: string,
  ) {
    const module = await this.moduleRepository.findById(moduleId);
    if (!module) throw new NotFoundError('Module not found');

    const maxOrder = await this.featureRepository.getMaxOrderNumber(moduleId);
    const feature = await this.featureRepository.create({
      moduleId,
      title: data.title,
      description: data.description ?? null,
      priority: data.priority,
      estimatedHours: data.estimatedHours ?? null,
      orderNumber: maxOrder + 1,
    });

    await this.activityService.log(
      module.projectId,
      'FEATURE_CREATED',
      `Feature "${feature.title}" was created`,
      actorId,
    );
    // A newly-added (incomplete) feature can knock a 100%-complete module
    // back out of COMPLETED, so re-sync before recomputing project progress.
    await this.progressService.syncModuleStatusAfterFeatureChange(moduleId);
    await this.progressService.recomputeProjectProgress(module.projectId);

    return serializeFeature(feature);
  }

  async update(id: string, data: FeatureMutationInput) {
    const existing = await this.featureRepository.findById(id);
    if (!existing) throw new NotFoundError('Feature not found');
    const updated = await this.featureRepository.update(id, data);
    return serializeFeature(updated);
  }

  async delete(id: string, actorId: string): Promise<void> {
    const existing = await this.featureRepository.findById(id);
    if (!existing) throw new NotFoundError('Feature not found');

    const module = await this.moduleRepository.findById(existing.moduleId);
    await this.featureRepository.delete(id);

    if (module) {
      const syncResult = await this.progressService.syncModuleStatusAfterFeatureChange(module.id);
      await this.progressService.recomputeProjectProgress(module.projectId);

      if (syncResult.becameCompleted) {
        await this.activityService.log(
          module.projectId,
          'MODULE_COMPLETED',
          `Module "${module.title}" completed`,
          actorId,
        );
        const project = await this.projectRepository.findById(module.projectId);
        if (project) {
          await this.notificationService.notifyModuleCompleted({
            projectId: module.projectId,
            recipientEmail: project.client.email,
            projectTitle: project.title,
            moduleTitle: module.title,
            progress: this.progressService.buildProgressSnapshot(project.modules),
          });
        }
      }
    }
  }

  async reorder(moduleId: string, orderedIds: string[]) {
    const module = await this.moduleRepository.findById(moduleId);
    if (!module) throw new NotFoundError('Module not found');

    const features = await this.featureRepository.findManyByModule(moduleId);
    const existingIds = new Set(features.map((feature) => feature.id));
    const uniqueOrderedIds = new Set(orderedIds);
    const isValid =
      orderedIds.length === features.length &&
      uniqueOrderedIds.size === orderedIds.length &&
      orderedIds.every((id) => existingIds.has(id));
    if (!isValid) {
      throw new ValidationError(
        'order must contain exactly the set of feature ids belonging to this module, with no duplicates',
      );
    }

    await this.featureRepository.reorder(moduleId, orderedIds);
    return this.listForModule(moduleId);
  }

  async listForModule(moduleId: string) {
    const features = await this.featureRepository.findManyByModule(moduleId);
    return features.map(serializeFeature);
  }

  async updateStatus(id: string, status: FeatureStatus, actorId: string) {
    const existing = await this.featureRepository.findById(id);
    if (!existing) throw new NotFoundError('Feature not found');

    const module = await this.moduleRepository.findById(existing.moduleId);
    if (!module) throw new NotFoundError('Parent module not found');

    const wasCompleted = existing.status === 'COMPLETED';
    const willBeCompleted = status === 'COMPLETED';

    let completedAt: Date | null = existing.completedAt;
    if (willBeCompleted && !wasCompleted) {
      completedAt = new Date();
    } else if (!willBeCompleted && wasCompleted) {
      completedAt = null;
    }

    const updated = await this.featureRepository.updateStatus(id, status, completedAt);

    // Memoized project lookup — used at most once even if both the feature
    // AND its parent module complete as part of this single request.
    let cachedProject: ProjectDetail | null | undefined;
    const getProject = async (): Promise<ProjectDetail | null> => {
      if (cachedProject === undefined) {
        cachedProject = await this.projectRepository.findById(module.projectId);
      }
      return cachedProject;
    };

    // Sync the parent module's status and persist project progress BEFORE
    // sending any completion email, so the email's progress snapshot (and the
    // project it re-fetches) reflect this very change.
    const syncResult = await this.progressService.syncModuleStatusAfterFeatureChange(module.id);
    await this.progressService.recomputeProjectProgress(module.projectId);

    if (willBeCompleted && !wasCompleted) {
      await this.activityService.log(
        module.projectId,
        'FEATURE_COMPLETED',
        `Feature "${updated.title}" completed`,
        actorId,
      );
      const project = await getProject();
      if (project) {
        await this.notificationService.notifyFeatureCompleted({
          projectId: module.projectId,
          recipientEmail: project.client.email,
          projectTitle: project.title,
          moduleTitle: module.title,
          featureTitle: updated.title,
          progress: this.progressService.buildProgressSnapshot(project.modules),
        });
      }
    }

    if (syncResult.becameCompleted) {
      await this.activityService.log(
        module.projectId,
        'MODULE_COMPLETED',
        `Module "${module.title}" completed`,
        actorId,
      );
      const project = await getProject();
      if (project) {
        await this.notificationService.notifyModuleCompleted({
          projectId: module.projectId,
          recipientEmail: project.client.email,
          projectTitle: project.title,
          moduleTitle: module.title,
          progress: this.progressService.buildProgressSnapshot(project.modules),
        });
      }
    }

    return serializeFeature(updated);
  }
}
