import type { File, StorageProvider } from '@prisma/client';
import { prisma } from './base';

export interface FileCreateData {
  projectId: string;
  moduleId?: string | null;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedBy?: string | null;
  storageProvider: StorageProvider;
  storageKey: string;
}

export interface IFileRepository {
  findById(id: string): Promise<File | null>;
  listByProject(projectId: string, moduleId?: string): Promise<File[]>;
  create(data: FileCreateData): Promise<File>;
  delete(id: string): Promise<void>;
}

export class PrismaFileRepository implements IFileRepository {
  async findById(id: string): Promise<File | null> {
    return prisma.file.findUnique({ where: { id } });
  }

  async listByProject(projectId: string, moduleId?: string): Promise<File[]> {
    return prisma.file.findMany({
      where: { projectId, ...(moduleId ? { moduleId } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: FileCreateData): Promise<File> {
    return prisma.file.create({
      data: {
        projectId: data.projectId,
        moduleId: data.moduleId ?? null,
        name: data.name,
        url: data.url,
        size: data.size,
        mimeType: data.mimeType,
        uploadedBy: data.uploadedBy ?? null,
        storageProvider: data.storageProvider,
        storageKey: data.storageKey,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.file.delete({ where: { id } });
  }
}

export const fileRepository: IFileRepository = new PrismaFileRepository();
