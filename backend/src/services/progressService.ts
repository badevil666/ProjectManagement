import type { Feature, FeatureStatus, Module, ModuleStatus } from '@prisma/client';
import type { IModuleRepository } from '../repositories/moduleRepository';
import type { IProjectRepository } from '../repositories/projectRepository';
import { NotFoundError } from '../utils/AppError';

export interface ModuleSyncResult {
  module: Module;
  /** True if this sync just transitioned the module INTO COMPLETED. */
  becameCompleted: boolean;
  /** True if this sync just transitioned the module OUT of COMPLETED (a feature was reopened). */
  becameReopened: boolean;
}

/** Minimal per-module shape needed to compute progress from a project tree. */
type ModuleProgressInput = {
  title: string;
  status: ModuleStatus;
  features: { title: string; status: FeatureStatus }[];
};

export interface EmailFeatureSummary {
  title: string;
  status: FeatureStatus;
}

export interface EmailModuleSummary {
  title: string;
  status: ModuleStatus;
  /** 0–100, this module's own feature-completion percentage. */
  progress: number;
  features: EmailFeatureSummary[];
}

/** A read-only snapshot of a project's module/feature progress, for emails. */
export interface ProjectProgressSnapshot {
  overallProgress: number;
  modules: EmailModuleSummary[];
}

/**
 * Implements the "Progress calculation" rules from API_CONTRACT.md:
 * - Module completion % = completedFeatures / totalFeatures (0 if no features).
 * - Module auto-transitions to COMPLETED when 100% of its features are
 *   complete; auto-transitions back to IN_PROGRESS if a feature is reopened
 *   (or a feature is added/removed such that the module is no longer 100%).
 * - Project overallProgress = average of module completion % across all
 *   modules (0 if no modules), rounded to nearest integer.
 */
export class ProgressService {
  constructor(
    private readonly moduleRepository: IModuleRepository,
    private readonly projectRepository: IProjectRepository,
  ) {}

  computeModuleCompletionPercentage(features: Pick<Feature, 'status'>[]): number {
    if (features.length === 0) return 0;
    const completed = features.filter((feature) => feature.status === 'COMPLETED').length;
    return Math.round((completed / features.length) * 100);
  }

  computeOverallProgress(modules: { features: Pick<Feature, 'status'>[] }[]): number {
    if (modules.length === 0) return 0;
    // Average the *raw* (unrounded) per-module completion percentages and
    // round only once at the end, per API_CONTRACT.md — averaging
    // already-rounded per-module percentages and rounding again can diverge
    // by 1 from the documented formula.
    const sum = modules.reduce((acc, module) => {
      const total = module.features.length;
      if (total === 0) return acc;
      const completed = module.features.filter((feature) => feature.status === 'COMPLETED').length;
      return acc + (completed / total) * 100;
    }, 0);
    return Math.round(sum / modules.length);
  }

  /**
   * Builds a read-only progress snapshot (overall % + per-module status and
   * percentage + each module's features) from an already-loaded project tree.
   * Pure — does not touch the database; reuses the same percentage math as
   * the persisted progress so the email numbers match the app exactly.
   */
  buildProgressSnapshot(modules: ModuleProgressInput[]): ProjectProgressSnapshot {
    return {
      overallProgress: this.computeOverallProgress(modules),
      modules: modules.map((module) => ({
        title: module.title,
        status: module.status,
        progress: this.computeModuleCompletionPercentage(module.features),
        features: module.features.map((feature) => ({
          title: feature.title,
          status: feature.status,
        })),
      })),
    };
  }

  /** Recomputes and persists Project.overallProgress from current module/feature state. */
  async recomputeProjectProgress(projectId: string): Promise<number> {
    const modules = await this.moduleRepository.findManyByProject(projectId);
    const overallProgress = this.computeOverallProgress(modules);
    await this.projectRepository.updateProgress(projectId, overallProgress);
    return overallProgress;
  }

  /**
   * Re-evaluates a single module's status against its current features and
   * auto-transitions it in either direction as needed. Safe to call after
   * any feature create/update/delete/status-change.
   */
  async syncModuleStatusAfterFeatureChange(moduleId: string): Promise<ModuleSyncResult> {
    const current = await this.moduleRepository.findByIdWithFeatures(moduleId);
    if (!current) throw new NotFoundError('Module not found');

    const { features, ...moduleFields } = current;
    const total = features.length;
    const completed = features.filter((feature) => feature.status === 'COMPLETED').length;
    const allComplete = total > 0 && completed === total;

    if (allComplete && moduleFields.status !== 'COMPLETED') {
      const updated = await this.moduleRepository.updateStatus(moduleId, 'COMPLETED', new Date());
      return { module: updated, becameCompleted: true, becameReopened: false };
    }

    if (!allComplete && moduleFields.status === 'COMPLETED') {
      const updated = await this.moduleRepository.updateStatus(moduleId, 'IN_PROGRESS', null);
      return { module: updated, becameCompleted: false, becameReopened: true };
    }

    return { module: moduleFields, becameCompleted: false, becameReopened: false };
  }
}
