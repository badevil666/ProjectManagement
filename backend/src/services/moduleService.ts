import type { ModuleStatus } from '@prisma/client';
import type { IFeatureRepository } from '../repositories/featureRepository';
import type { IModuleRepository } from '../repositories/moduleRepository';
import type { IProjectRepository } from '../repositories/projectRepository';
import { NotFoundError, ValidationError } from '../utils/AppError';
import type { ActivityService } from './activityService';
import type { ProgressService } from './progressService';
import { serializeModuleWithFeatures } from './serializers/moduleSerializer';

export interface ModuleMutationInput {
  title?: string;
  description?: string | null;
  estimatedHours?: string | null;
}

async function loadWithFeaturesOrThrow(moduleRepository: IModuleRepository, id: string) {
  const module = await moduleRepository.findByIdWithFeatures(id);
  if (!module) throw new NotFoundError('Module not found');
  return module;
}

export class ModuleService {
  constructor(
    private readonly moduleRepository: IModuleRepository,
    private readonly featureRepository: IFeatureRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly activityService: ActivityService,
    private readonly progressService: ProgressService,
  ) {}

  async create(
    projectId: string,
    data: Required<Pick<ModuleMutationInput, 'title'>> & ModuleMutationInput,
    actorId: string,
  ) {
    const projectExists = await this.projectRepository.exists(projectId);
    if (!projectExists) throw new NotFoundError('Project not found');

    const maxOrder = await this.moduleRepository.getMaxOrderNumber(projectId);
    const module = await this.moduleRepository.create({
      projectId,
      title: data.title,
      description: data.description ?? null,
      estimatedHours: data.estimatedHours ?? null,
      orderNumber: maxOrder + 1,
    });

    await this.activityService.log(
      projectId,
      'MODULE_CREATED',
      `Module "${module.title}" was created`,
      actorId,
    );
    await this.progressService.recomputeProjectProgress(projectId);

    const withFeatures = await loadWithFeaturesOrThrow(this.moduleRepository, module.id);
    return serializeModuleWithFeatures(withFeatures, this.progressService);
  }

  async update(id: string, data: ModuleMutationInput) {
    const existing = await this.moduleRepository.findById(id);
    if (!existing) throw new NotFoundError('Module not found');

    await this.moduleRepository.update(id, data);
    const withFeatures = await loadWithFeaturesOrThrow(this.moduleRepository, id);
    return serializeModuleWithFeatures(withFeatures, this.progressService);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.moduleRepository.findById(id);
    if (!existing) throw new NotFoundError('Module not found');

    await this.moduleRepository.delete(id);
    await this.progressService.recomputeProjectProgress(existing.projectId);
  }

  async reorder(projectId: string, orderedIds: string[]) {
    const projectExists = await this.projectRepository.exists(projectId);
    if (!projectExists) throw new NotFoundError('Project not found');

    const modules = await this.moduleRepository.findManyByProject(projectId);
    const existingIds = new Set(modules.map((module) => module.id));
    const uniqueOrderedIds = new Set(orderedIds);
    const isValid =
      orderedIds.length === modules.length &&
      uniqueOrderedIds.size === orderedIds.length &&
      orderedIds.every((id) => existingIds.has(id));
    if (!isValid) {
      throw new ValidationError(
        'order must contain exactly the set of module ids belonging to this project, with no duplicates',
      );
    }

    await this.moduleRepository.reorder(projectId, orderedIds);
    return this.listForProject(projectId);
  }

  async listForProject(projectId: string) {
    const modules = await this.moduleRepository.findManyByProject(projectId);
    return modules.map((module) => serializeModuleWithFeatures(module, this.progressService));
  }

  async updateStatus(id: string, status: ModuleStatus, actorId: string) {
    const existing = await loadWithFeaturesOrThrow(this.moduleRepository, id);

    if (status === 'COMPLETED') {
      if (existing.status !== 'COMPLETED') {
        const now = new Date();
        // Cascade: any feature not yet complete is marked complete too.
        await this.featureRepository.completeAllIncomplete(id, now);
        await this.moduleRepository.updateStatus(id, 'COMPLETED', now);

        await this.activityService.log(
          existing.projectId,
          'MODULE_COMPLETED',
          `Module "${existing.title}" completed`,
          actorId,
        );
        await this.progressService.recomputeProjectProgress(existing.projectId);
        // Completion emails are sent explicitly by the admin, not automatically
        // (see ProjectNotificationService).
      }
    } else {
      await this.moduleRepository.updateStatus(id, status, null);
      await this.progressService.recomputeProjectProgress(existing.projectId);
    }

    const withFeatures = await loadWithFeaturesOrThrow(this.moduleRepository, id);
    return serializeModuleWithFeatures(withFeatures, this.progressService);
  }
}
