import type { Feature, Module, ModuleStatus } from '@prisma/client';
import { prisma } from './base';

export interface ModuleCreateData {
  projectId: string;
  title: string;
  description?: string | null;
  estimatedHours?: string | null;
  orderNumber: number;
}

export interface ModuleUpdateData {
  title?: string;
  description?: string | null;
  estimatedHours?: string | null;
}

export type ModuleWithFeatures = Module & { features: Feature[] };

export interface IModuleRepository {
  findById(id: string): Promise<Module | null>;
  findByIdWithFeatures(id: string): Promise<ModuleWithFeatures | null>;
  findManyByProject(projectId: string): Promise<ModuleWithFeatures[]>;
  getMaxOrderNumber(projectId: string): Promise<number>;
  create(data: ModuleCreateData): Promise<Module>;
  update(id: string, data: ModuleUpdateData): Promise<Module>;
  delete(id: string): Promise<void>;
  reorder(projectId: string, orderedIds: string[]): Promise<void>;
  updateStatus(id: string, status: ModuleStatus, completedAt: Date | null): Promise<Module>;
}

export class PrismaModuleRepository implements IModuleRepository {
  async findById(id: string): Promise<Module | null> {
    return prisma.module.findUnique({ where: { id } });
  }

  async findByIdWithFeatures(id: string): Promise<ModuleWithFeatures | null> {
    return prisma.module.findUnique({
      where: { id },
      include: { features: { orderBy: { orderNumber: 'asc' } } },
    });
  }

  async findManyByProject(projectId: string): Promise<ModuleWithFeatures[]> {
    return prisma.module.findMany({
      where: { projectId },
      include: { features: { orderBy: { orderNumber: 'asc' } } },
      orderBy: { orderNumber: 'asc' },
    });
  }

  async getMaxOrderNumber(projectId: string): Promise<number> {
    const result = await prisma.module.aggregate({
      where: { projectId },
      _max: { orderNumber: true },
    });
    return result._max.orderNumber ?? -1;
  }

  async create(data: ModuleCreateData): Promise<Module> {
    return prisma.module.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description ?? null,
        estimatedHours: data.estimatedHours ?? null,
        orderNumber: data.orderNumber,
      },
    });
  }

  async update(id: string, data: ModuleUpdateData): Promise<Module> {
    return prisma.module.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.estimatedHours !== undefined ? { estimatedHours: data.estimatedHours } : {}),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.module.delete({ where: { id } });
  }

  async reorder(projectId: string, orderedIds: string[]): Promise<void> {
    // `updateMany` (unlike `update`) accepts a non-unique compound filter, so
    // this doubles as a defense-in-depth check that every id truly belongs
    // to this project — a mismatched id is simply a no-op update.
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.module.updateMany({
          where: { id, projectId },
          data: { orderNumber: index },
        }),
      ),
    );
  }

  async updateStatus(id: string, status: ModuleStatus, completedAt: Date | null): Promise<Module> {
    return prisma.module.update({ where: { id }, data: { status, completedAt } });
  }
}

export const moduleRepository: IModuleRepository = new PrismaModuleRepository();
