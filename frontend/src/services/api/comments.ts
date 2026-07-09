import { apiClient } from './client';
import type { Comment, CommentInput } from '@/types';

export const commentsApi = {
  list: async (projectId: string): Promise<Comment[]> => {
    const { data } = await apiClient.get<Comment[]>(`/projects/${projectId}/comments`);
    return data;
  },

  create: async (projectId: string, body: CommentInput): Promise<Comment> => {
    const { data } = await apiClient.post<Comment>(`/projects/${projectId}/comments`, body);
    return data;
  },
};
