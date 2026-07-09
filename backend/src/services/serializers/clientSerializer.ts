import type { Client } from '@prisma/client';
import type { ClientWithProjects } from '../../repositories/clientRepository';

export interface ClientSummary {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
}

export function serializeClientSummary(client: ClientSummary) {
  return {
    id: client.id,
    companyName: client.companyName,
    contactPerson: client.contactPerson,
    email: client.email,
  };
}

export function serializeClient(client: Client) {
  return {
    id: client.id,
    companyName: client.companyName,
    contactPerson: client.contactPerson,
    email: client.email,
    phone: client.phone,
    address: client.address,
    industry: client.industry,
    notes: client.notes,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  };
}

export function serializeClientWithProjects(client: ClientWithProjects) {
  return {
    ...serializeClient(client),
    projects: client.projects.map((project) => ({
      id: project.id,
      title: project.title,
      status: project.status,
      priority: project.priority,
      overallProgress: project.overallProgress,
      startDate: project.startDate,
      expectedEndDate: project.expectedEndDate,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    })),
  };
}
