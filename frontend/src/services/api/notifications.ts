import { apiClient } from './client';

export type CompletionEmailKind = 'MODULE' | 'FEATURE' | 'PROJECT';

export interface SendCompletionEmailBody {
  kind: CompletionEmailKind;
  moduleId?: string;
  featureId?: string;
  recipients: string[];
}

export interface SendCompletionEmailResult {
  sent: number;
  failed: number;
  recipients: string[];
}

export const notificationsApi = {
  /** Explicitly send a project-update email to chosen client recipients. */
  sendCompletion: async (
    projectId: string,
    body: SendCompletionEmailBody,
  ): Promise<SendCompletionEmailResult> => {
    const { data } = await apiClient.post<SendCompletionEmailResult>(
      `/projects/${projectId}/notifications/send`,
      body,
    );
    return data;
  },
};
