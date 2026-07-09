import { apiClient } from './client';
import type { FilesQueryParams, ProjectFile } from '@/types';

export const filesApi = {
  list: async (projectId: string, params?: FilesQueryParams): Promise<ProjectFile[]> => {
    const { data } = await apiClient.get<ProjectFile[]>(`/projects/${projectId}/files`, {
      params,
    });
    return data;
  },

  upload: async (
    projectId: string,
    file: File,
    moduleId?: string,
    onProgress?: (percent: number) => void,
  ): Promise<ProjectFile> => {
    const formData = new FormData();
    formData.append('file', file);
    if (moduleId) {
      formData.append('moduleId', moduleId);
    }
    const { data } = await apiClient.post<ProjectFile>(`/projects/${projectId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/files/${id}`);
  },

  download: async (id: string): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>(`/files/${id}/download`, {
      responseType: 'blob',
    });
    return data;
  },
};
