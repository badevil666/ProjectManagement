import type { File } from '@prisma/client';

export function serializeFile(file: File, downloadUrl: string) {
  return {
    id: file.id,
    projectId: file.projectId,
    moduleId: file.moduleId,
    name: file.name,
    size: file.size,
    mimeType: file.mimeType,
    uploadedBy: file.uploadedBy,
    downloadUrl,
    createdAt: file.createdAt,
  };
}
