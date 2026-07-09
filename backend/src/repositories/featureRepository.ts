import type { Feature, FeaturePriority, FeatureStatus } from '@prisma/client';
import { prisma } from './base';

export interface FeatureCreateData {
  moduleId: string;
  title: string;
  description?: string | null;
  priority?: FeaturePriority;
  estimatedHours?: string | null;
  orderNumber: number;
}

export interface FeatureUpdateData {
  title?: string;
  description?: string | null;
  priority?: FeaturePriority;
  estimatedHours?: string | null;
}

export interface FeatureCounts {
  total: number;
  completed: number;
}

export interface IFeatureRepository {
  findById(id: string): Promise<Feature | null>;
  findManyByModule(moduleId: string): Promise<Feature[]>;
  getMaxOrderNumber(moduleId: string): Promise<number>;
  create(data: FeatureCreateData): Promise<Feature>;
  update(id: string, data: FeatureUpdateData): Promise<Feature>;
  delete(id: string): Promise<void>;
  reorder(moduleId: string, orderedIds: string[]): Promise<void>;
  updateStatus(id: string, status: FeatureStatus, completedAt: Date | null): Promise<Feature>;
  countsByModule(moduleId: string): Promise<FeatureCounts>;
  completeAllIncomplete(moduleId: string, completedAt: Date): Promise<void>;
}

export class PrismaFeatureRepository implements IFeatureRepository {
  async findById(id: string): Promise<Feature | null> {
    return prisma.feature.findUnique({ where: { id } });
  }

  async findManyByModule(moduleId: string): Promise<Feature[]> {
    return prisma.feature.findMany({ where: { moduleId }, orderBy: { orderNumber: 'asc' } });
  }

  async getMaxOrderNumber(moduleId: string): Promise<number> {
    const result = await prisma.feature.aggregate({
      where: { moduleId },
      _max: { orderNumber: true },
    });
    return result._max.orderNumber ?? -1;
  }

  async create(data: FeatureCreateData): Promise<Feature> {
    return prisma.feature.create({
      data: {
        moduleId: data.moduleId,
        title: data.title,
        description: data.description ?? null,
        priority: data.priority ?? undefined,
        estimatedHours: data.estimatedHours ?? null,
        orderNumber: data.orderNumber,
      },
    });
  }

  async update(id: string, data: FeatureUpdateData): Promise<Feature> {
    return prisma.feature.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.priority !== undefined ? { priority: data.priority } : {}),
        ...(data.estimatedHours !== undefined ? { estimatedHours: data.estimatedHours } : {}),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.feature.delete({ where: { id } });
  }

  async reorder(moduleId: string, orderedIds: string[]): Promise<void> {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.feature.updateMany({
          where: { id, moduleId },
          data: { orderNumber: index },
        }),
      ),
    );
  }

  async updateStatus(
    id: string,
    status: FeatureStatus,
    completedAt: Date | null,
  ): Promise<Feature> {
    return prisma.feature.update({ where: { id }, data: { status, completedAt } });
  }

  async countsByModule(moduleId: string): Promise<FeatureCounts> {
    const [total, completed] = await Promise.all([
      prisma.feature.count({ where: { moduleId } }),
      prisma.feature.count({ where: { moduleId, status: 'COMPLETED' } }),
    ]);
    return { total, completed };
  }

  async completeAllIncomplete(moduleId: string, completedAt: Date): Promise<void> {
    await prisma.feature.updateMany({
      where: { moduleId, status: { not: 'COMPLETED' } },
      data: { status: 'COMPLETED', completedAt },
    });
  }
}

export const featureRepository: IFeatureRepository = new PrismaFeatureRepository();
