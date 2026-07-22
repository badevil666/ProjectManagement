import type { FeaturePriority, FeatureStatus } from '@prisma/client';
import type { IFeatureRepository } from '../repositories/featureRepository';
import type { IModuleRepository } from '../repositories/moduleRepository';
import { NotFoundError, ValidationError } from '../utils/AppError';
import type { ActivityService } from './activityService';
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
    private readonly activityService: ActivityService,
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

    // Sync the parent module's status and persist project progress. Completion
    // emails are NOT sent automatically — the admin sends project updates
    // explicitly, choosing recipients (see ProjectNotificationService).
    const syncResult = await this.progressService.syncModuleStatusAfterFeatureChange(module.id);
    await this.progressService.recomputeProjectProgress(module.projectId);

    if (willBeCompleted && !wasCompleted) {
      await this.activityService.log(
        module.projectId,
        'FEATURE_COMPLETED',
        `Feature "${updated.title}" completed`,
        actorId,
      );
    }

    if (syncResult.becameCompleted) {
      await this.activityService.log(
        module.projectId,
        'MODULE_COMPLETED',
        `Module "${module.title}" completed`,
        actorId,
      );
    }

    return serializeFeature(updated);
  }
}
