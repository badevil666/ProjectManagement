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

export interface PreviewEmailBody {
  kind: CompletionEmailKind;
  moduleId?: string;
  featureId?: string;
}

export interface EmailPreview {
  subject: string;
  html: string;
  text: string;
}

export const notificationsApi = {
  /** Renders the exact email that would be sent, without sending it. */
  preview: async (projectId: string, body: PreviewEmailBody): Promise<EmailPreview> => {
    const { data } = await apiClient.post<EmailPreview>(
      `/projects/${projectId}/notifications/preview`,
      body,
    );
    return data;
  },

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
