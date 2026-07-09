import type {
  ClientCreateData,
  ClientUpdateData,
  IClientRepository,
} from '../repositories/clientRepository';
import type { IFileRepository } from '../repositories/fileRepository';
import type { StorageService } from './storage/StorageService';
import { ConflictError, NotFoundError } from '../utils/AppError';
import { buildMeta, parsePagination } from '../utils/pagination';
import { logger } from '../utils/logger';
import { serializeClient, serializeClientWithProjects } from './serializers/clientSerializer';

export class ClientService {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly fileRepository: IFileRepository,
    private readonly storageService: StorageService,
  ) {}

  async list(query: { page?: unknown; limit?: unknown; search?: string }) {
    const { page, limit, skip, take } = parsePagination(query);
    const search = query.search?.trim() || undefined;

    const [items, total] = await Promise.all([
      this.clientRepository.findMany({ skip, take, search }),
      this.clientRepository.count({ search }),
    ]);

    return {
      data: items.map(serializeClient),
      meta: buildMeta(page, limit, total),
    };
  }

  async getById(id: string) {
    const client = await this.clientRepository.findByIdWithProjects(id);
    if (!client) throw new NotFoundError('Client not found');
    return serializeClientWithProjects(client);
  }

  async create(data: ClientCreateData) {
    const existing = await this.clientRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('A client with this email already exists');
    }
    const client = await this.clientRepository.create(data);
    return serializeClient(client);
  }

  async update(id: string, data: ClientUpdateData) {
    const existing = await this.clientRepository.findById(id);
    if (!existing) throw new NotFoundError('Client not found');

    if (data.email && data.email !== existing.email) {
      const emailOwner = await this.clientRepository.findByEmail(data.email);
      if (emailOwner) throw new ConflictError('A client with this email already exists');
    }

    const updated = await this.clientRepository.update(id, data);
    return serializeClient(updated);
  }

  async delete(id: string, force: boolean): Promise<void> {
    const existing = await this.clientRepository.findById(id);
    if (!existing) throw new NotFoundError('Client not found');

    const activeProjectCount = await this.clientRepository.countActiveProjects(id);
    if (activeProjectCount > 0 && !force) {
      throw new ConflictError(
        `Client has ${activeProjectCount} active project(s). Pass ?force=true to delete anyway.`,
        { activeProjectCount },
      );
    }

    // Clean up any uploaded files on disk before the cascade delete removes
    // the DB rows, so we never leave orphaned objects in storage.
    const withProjects = await this.clientRepository.findByIdWithProjects(id);
    if (withProjects) {
      for (const project of withProjects.projects) {
        const files = await this.fileRepository.listByProject(project.id);
        for (const file of files) {
          try {
            await this.storageService.delete(file.storageKey);
          } catch (error) {
            logger.error(`Failed to delete storage object for file ${file.id}`, error);
          }
        }
      }
    }

    await this.clientRepository.delete(id);
  }
}
