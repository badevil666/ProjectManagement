import { apiClient } from './client';
import type { ShareLink, ShareLinkCreateInput, ShareLinkCreateResponse } from '@/types';

export const shareLinksApi = {
  list: async (projectId: string): Promise<ShareLink[]> => {
    const { data } = await apiClient.get<ShareLink[]>(`/projects/${projectId}/share-links`);
    return data;
  },

  create: async (
    projectId: string,
    body: ShareLinkCreateInput,
  ): Promise<ShareLinkCreateResponse> => {
    const { data } = await apiClient.post<ShareLinkCreateResponse>(
      `/projects/${projectId}/share-links`,
      body,
    );
    return data;
  },

  revoke: async (id: string): Promise<ShareLink> => {
    const { data } = await apiClient.patch<ShareLink>(`/share-links/${id}/revoke`);
    return data;
  },
};
