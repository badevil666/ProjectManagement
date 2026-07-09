import type { ShareLink } from '@prisma/client';
import { prisma } from './base';

export interface ShareLinkCreateData {
  projectId: string;
  token: string;
  expiresAt?: Date | null;
  createdBy?: string | null;
}

export interface IShareLinkRepository {
  findById(id: string): Promise<ShareLink | null>;
  findByToken(token: string): Promise<ShareLink | null>;
  listByProject(projectId: string): Promise<ShareLink[]>;
  create(data: ShareLinkCreateData): Promise<ShareLink>;
  revoke(id: string): Promise<ShareLink>;
  registerAccess(id: string): Promise<void>;
}

export class PrismaShareLinkRepository implements IShareLinkRepository {
  async findById(id: string): Promise<ShareLink | null> {
    return prisma.shareLink.findUnique({ where: { id } });
  }

  async findByToken(token: string): Promise<ShareLink | null> {
    return prisma.shareLink.findUnique({ where: { token } });
  }

  async listByProject(projectId: string): Promise<ShareLink[]> {
    return prisma.shareLink.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
  }

  async create(data: ShareLinkCreateData): Promise<ShareLink> {
    return prisma.shareLink.create({
      data: {
        projectId: data.projectId,
        token: data.token,
        expiresAt: data.expiresAt ?? null,
        createdBy: data.createdBy ?? null,
      },
    });
  }

  async revoke(id: string): Promise<ShareLink> {
    return prisma.shareLink.update({ where: { id }, data: { revoked: true } });
  }

  async registerAccess(id: string): Promise<void> {
    await prisma.shareLink.update({
      where: { id },
      data: { accessCount: { increment: 1 }, lastAccessedAt: new Date() },
    });
  }
}

export const shareLinkRepository: IShareLinkRepository = new PrismaShareLinkRepository();
