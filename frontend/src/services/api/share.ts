import { apiClient } from './client';
import type { Activity, Comment, ShareCommentInput } from '@/types';
import type { SharedProjectDetail } from '@/types/share';

export const shareApi = {
  getProject: async (token: string): Promise<SharedProjectDetail> => {
    const { data } = await apiClient.get<SharedProjectDetail>(`/share/${token}`);
    return data;
  },

  getTimeline: async (token: string): Promise<Activity[]> => {
    const { data } = await apiClient.get<Activity[]>(`/share/${token}/timeline`);
    return data;
  },

  /** Public, unauthenticated download URL — safe to use directly as an
   * anchor href since access is gated by the unguessable token, not a JWT. */
  fileDownloadUrl: (token: string, fileId: string): string =>
    `${apiClient.defaults.baseURL}/share/${token}/files/${fileId}/download`,

  addComment: async (token: string, body: ShareCommentInput): Promise<Comment> => {
    const { data } = await apiClient.post<Comment>(`/share/${token}/comments`, body);
    return data;
  },
};
