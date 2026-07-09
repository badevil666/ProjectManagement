import type { AuthorType, Comment } from '@prisma/client';
import { prisma } from './base';

export interface CommentCreateData {
  projectId: string;
  authorType: AuthorType;
  authorName: string;
  message: string;
}

export interface ICommentRepository {
  listByProject(projectId: string): Promise<Comment[]>;
  create(data: CommentCreateData): Promise<Comment>;
  countByProject(projectId: string): Promise<number>;
}

export class PrismaCommentRepository implements ICommentRepository {
  async listByProject(projectId: string): Promise<Comment[]> {
    return prisma.comment.findMany({ where: { projectId }, orderBy: { createdAt: 'asc' } });
  }

  async create(data: CommentCreateData): Promise<Comment> {
    return prisma.comment.create({ data });
  }

  async countByProject(projectId: string): Promise<number> {
    return prisma.comment.count({ where: { projectId } });
  }
}

export const commentRepository: ICommentRepository = new PrismaCommentRepository();
