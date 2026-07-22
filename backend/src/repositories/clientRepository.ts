import type { Client } from '@prisma/client';
import { prisma } from './base';

export interface ClientCreateData {
  companyName: string;
  contactPerson: string;
  email: string;
  additionalEmails?: string[];
  phone?: string | null;
  address?: string | null;
  industry?: string | null;
  notes?: string | null;
}

export type ClientUpdateData = Partial<ClientCreateData>;

export interface ClientProjectSummary {
  id: string;
  title: string;
  status: string;
  priority: string;
  overallProgress: number;
  startDate: Date | null;
  expectedEndDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientWithProjects extends Client {
  projects: ClientProjectSummary[];
}

export interface IClientRepository {
  findMany(params: { skip: number; take: number; search?: string }): Promise<Client[]>;
  count(params: { search?: string }): Promise<number>;
  findById(id: string): Promise<Client | null>;
  findByIdWithProjects(id: string): Promise<ClientWithProjects | null>;
  findByEmail(email: string): Promise<Client | null>;
  create(data: ClientCreateData): Promise<Client>;
  update(id: string, data: ClientUpdateData): Promise<Client>;
  delete(id: string): Promise<void>;
  countActiveProjects(clientId: string): Promise<number>;
}

function searchFilter(search?: string) {
  if (!search) return {};
  return {
    OR: [
      { companyName: { contains: search, mode: 'insensitive' as const } },
      { contactPerson: { contains: search, mode: 'insensitive' as const } },
      { email: { contains: search, mode: 'insensitive' as const } },
    ],
  };
}

export class PrismaClientRepository implements IClientRepository {
  async findMany(params: { skip: number; take: number; search?: string }): Promise<Client[]> {
    return prisma.client.findMany({
      where: searchFilter(params.search),
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(params: { search?: string }): Promise<number> {
    return prisma.client.count({ where: searchFilter(params.search) });
  }

  async findById(id: string): Promise<Client | null> {
    return prisma.client.findUnique({ where: { id } });
  }

  async findByIdWithProjects(id: string): Promise<ClientWithProjects | null> {
    return prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            overallProgress: true,
            startDate: true,
            expectedEndDate: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findByEmail(email: string): Promise<Client | null> {
    return prisma.client.findUnique({ where: { email } });
  }

  async create(data: ClientCreateData): Promise<Client> {
    return prisma.client.create({ data });
  }

  async update(id: string, data: ClientUpdateData): Promise<Client> {
    return prisma.client.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.client.delete({ where: { id } });
  }

  async countActiveProjects(clientId: string): Promise<number> {
    return prisma.project.count({
      where: {
        clientId,
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
      },
    });
  }
}

export const clientRepository: IClientRepository = new PrismaClientRepository();
