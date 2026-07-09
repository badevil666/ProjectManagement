import { apiClient } from './client';
import type { LoginRequest, LoginResponse, User } from '@/types';

export const authApi = {
  login: async (body: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', body);
    return data;
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },
};
