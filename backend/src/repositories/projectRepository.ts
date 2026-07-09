import { Prisma, ProjectPriority, ProjectStatus, ShareLink } from '@prisma/client';
import { prisma } from './base';

export interface ProjectCreateData {
  clientId: string;
  title: string;
  description?: string | null;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: Date | null;
  expectedEndDate?: Date | null;
  budget?: string | null;
  currency?: string;
  createdBy: string;
}

export type ProjectUpdateData = Partial<Omit<ProjectCreateData, 'createdBy'>> & {
  actualEndDate?: Date | null;
};

export interface ProjectListFilters {
  skip: number;
  take: number;
  status?: ProjectStatus;
  clientId?: string;
  search?: string;
}

const clientSummarySelect = {
  id: true,
  companyName: true,
  contactPerson: true,
  email: true,
} satisfies Prisma.ClientSelect;

const projectListInclude = {
  client: { select: clientSummarySelect },
} satisfies Prisma.ProjectInclude;

export type ProjectListItem = Prisma.ProjectGetPayload<{ include: typeof projectListInclude }>;

const projectDetailInclude = {
  client: true,
  modules: {
    orderBy: { orderNumber: 'asc' as const },
    include: {
      features: { orderBy: { orderNumber: 'asc' as const } },
    },
  },
  files: { orderBy: { createdAt: 'desc' as const } },
  _count: { select: { comments: true } },
} satisfies Prisma.ProjectInclude;

export type ProjectDetail = Prisma.ProjectGetPayload<{ include: typeof projectDetailInclude }> & {
  shareLinks: ShareLink[];
};

function searchFilter(search?: string): Prisma.ProjectWhereInput {
  if (!search) return {};
  return {
    OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ],
  };
}

function buildWhere(filters: {
  status?: ProjectStatus;
  clientId?: string;
  search?: string;
}): Prisma.ProjectWhereInput {
  return {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.clientId ? { clientId: filters.clientId } : {}),
    ...searchFilter(filters.search),
  };
}

export interface IProjectRepository {
  findManyWithFilters(filters: ProjectListFilters): Promise<ProjectListItem[]>;
  count(filters: Omit<ProjectListFilters, 'skip' | 'take'>): Promise<number>;
  findById(id: string): Promise<ProjectDetail | null>;
  exists(id: string): Promise<boolean>;
  create(data: ProjectCreateData): Promise<ProjectDetail>;
  update(id: string, data: ProjectUpdateData): Promise<ProjectDetail>;
  delete(id: string): Promise<void>;
  updateProgress(id: string, overallProgress: number): Promise<void>;
  countAll(): Promise<number>;
  countByStatuses(statuses: ProjectStatus[]): Promise<number>;
  countOverdueActive(): Promise<number>;
}

export class PrismaProjectRepository implements IProjectRepository {
  async findManyWithFilters(filters: ProjectListFilters): Promise<ProjectListItem[]> {
    return prisma.project.findMany({
      where: buildWhere(filters),
      include: projectListInclude,
      orderBy: { createdAt: 'desc' },
      skip: filters.skip,
      take: filters.take,
    });
  }

  async count(filters: Omit<ProjectListFilters, 'skip' | 'take'>): Promise<number> {
    return prisma.project.count({ where: buildWhere(filters) });
  }

  async findById(id: string): Promise<ProjectDetail | null> {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        ...projectDetailInclude,
        shareLinks: {
          where: {
            revoked: false,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return project as ProjectDetail | null;
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.project.count({ where: { id } });
    return count > 0;
  }

  async create(data: ProjectCreateData): Promise<ProjectDetail> {
    const created = await prisma.project.create({
      data: {
        clientId: data.clientId,
        title: data.title,
        description: data.description ?? null,
        status: data.status ?? undefined,
        priority: data.priority ?? undefined,
        startDate: data.startDate ?? null,
        expectedEndDate: data.expectedEndDate ?? null,
        budget: data.budget ?? null,
        currency: data.currency ?? undefined,
        createdBy: data.createdBy,
      },
      select: { id: true },
    });
    const full = await this.findById(created.id);
    if (!full) throw new Error('Failed to load project immediately after creation');
    return full;
  }

  async update(id: string, data: ProjectUpdateData): Promise<ProjectDetail> {
    await prisma.project.update({
      where: { id },
      data: {
        ...(data.clientId !== undefined ? { clientId: data.clientId } : {}),
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.priority !== undefined ? { priority: data.priority } : {}),
        ...(data.startDate !== undefined ? { startDate: data.startDate } : {}),
        ...(data.expectedEndDate !== undefined ? { expectedEndDate: data.expectedEndDate } : {}),
        ...(data.actualEndDate !== undefined ? { actualEndDate: data.actualEndDate } : {}),
        ...(data.budget !== undefined ? { budget: data.budget } : {}),
        ...(data.currency !== undefined ? { currency: data.currency } : {}),
      },
    });
    const full = await this.findById(id);
    if (!full) throw new Error('Failed to load project immediately after update');
    return full;
  }

  async delete(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } });
  }

  async updateProgress(id: string, overallProgress: number): Promise<void> {
    await prisma.project.update({ where: { id }, data: { overallProgress } });
  }

  async countAll(): Promise<number> {
    return prisma.project.count();
  }

  async countByStatuses(statuses: ProjectStatus[]): Promise<number> {
    return prisma.project.count({ where: { status: { in: statuses } } });
  }

  async countOverdueActive(): Promise<number> {
    return prisma.project.count({
      where: {
        expectedEndDate: { lt: new Date() },
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
      },
    });
  }
}

export const projectRepository: IProjectRepository = new PrismaProjectRepository();
