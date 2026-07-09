import type { IFileRepository } from '../repositories/fileRepository';
import type { IModuleRepository } from '../repositories/moduleRepository';
import type { IProjectRepository } from '../repositories/projectRepository';
import { NotFoundError, ValidationError } from '../utils/AppError';
import { fileDownloadUrl } from '../utils/urls';
import type { ActivityService } from './activityService';
import { serializeFile } from './serializers/fileSerializer';
import type { StorageService } from './storage/StorageService';

export interface UploadFileInput {
  projectId: string;
  moduleId?: string;
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  uploadedBy?: string | null;
}

export class FileService {
  constructor(
    private readonly fileRepository: IFileRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly moduleRepository: IModuleRepository,
    private readonly storageService: StorageService,
    private readonly activityService: ActivityService,
  ) {}

  async upload(input: UploadFileInput) {
    const projectExists = await this.projectRepository.exists(input.projectId);
    if (!projectExists) throw new NotFoundError('Project not found');

    if (input.moduleId) {
      const module = await this.moduleRepository.findById(input.moduleId);
      if (!module || module.projectId !== input.projectId) {
        throw new ValidationError('moduleId does not belong to this project');
      }
    }

    const stored = await this.storageService.save({
      buffer: input.buffer,
      originalName: input.originalName,
      mimeType: input.mimeType,
    });

    const file = await this.fileRepository.create({
      projectId: input.projectId,
      moduleId: input.moduleId ?? null,
      name: input.originalName,
      url: stored.url,
      size: stored.size,
      mimeType: input.mimeType,
      uploadedBy: input.uploadedBy ?? null,
      storageProvider: 'LOCAL',
      storageKey: stored.key,
    });

    await this.activityService.log(
      input.projectId,
      'FILE_UPLOADED',
      `File "${file.name}" was uploaded`,
      input.uploadedBy ?? null,
    );

    return serializeFile(file, fileDownloadUrl(file.id));
  }

  async listForProject(projectId: string, moduleId?: string) {
    const projectExists = await this.projectRepository.exists(projectId);
    if (!projectExists) throw new NotFoundError('Project not found');

    const files = await this.fileRepository.listByProject(projectId, moduleId);
    return files.map((file) => serializeFile(file, fileDownloadUrl(file.id)));
  }

  async getFileForDownload(fileId: string) {
    const file = await this.fileRepository.findById(fileId);
    if (!file) throw new NotFoundError('File not found');
    return { file, stream: this.storageService.getReadStream(file.storageKey) };
  }

  async delete(fileId: string): Promise<void> {
    const file = await this.fileRepository.findById(fileId);
    if (!file) throw new NotFoundError('File not found');

    await this.storageService.delete(file.storageKey);
    await this.fileRepository.delete(fileId);
  }
}
