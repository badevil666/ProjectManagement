import { apiClient } from './client';
import type {
  Client,
  ClientDetail,
  ClientInput,
  ClientUpdateInput,
  ClientsQueryParams,
  PaginatedResponse,
} from '@/types';

export const clientsApi = {
  list: async (params?: ClientsQueryParams): Promise<PaginatedResponse<Client>> => {
    const { data } = await apiClient.get<PaginatedResponse<Client>>('/clients', { params });
    return data;
  },

  get: async (id: string): Promise<ClientDetail> => {
    const { data } = await apiClient.get<ClientDetail>(`/clients/${id}`);
    return data;
  },

  create: async (body: ClientInput): Promise<Client> => {
    const { data } = await apiClient.post<Client>('/clients', body);
    return data;
  },

  update: async (id: string, body: ClientUpdateInput): Promise<Client> => {
    const { data } = await apiClient.put<Client>(`/clients/${id}`, body);
    return data;
  },

  remove: async (id: string, force = false): Promise<void> => {
    await apiClient.delete(`/clients/${id}`, { params: force ? { force: true } : undefined });
  },
};
