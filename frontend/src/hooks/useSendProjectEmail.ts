import { useMutation } from '@tanstack/react-query';
import { notificationsApi, type SendCompletionEmailBody } from '@/services/api';

/** Explicitly sends a project-update email to chosen recipients (no cache to invalidate). */
export function useSendProjectEmail(projectId: string) {
  return useMutation({
    mutationFn: (body: SendCompletionEmailBody) => notificationsApi.sendCompletion(projectId, body),
  });
}
