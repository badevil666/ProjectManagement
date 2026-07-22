import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useSendProjectEmail } from '@/hooks/useSendProjectEmail';
import { isApiError } from '@/services/api/apiError';
import type { CompletionEmailKind } from '@/services/api/notifications';

interface SendUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  /** Full pool of the client's email addresses (primary + additional). */
  clientEmails: string[];
  kind: CompletionEmailKind;
  moduleId?: string;
  featureId?: string;
  /** Human label for what the email is about (module title / project title). */
  contextLabel: string;
}

export function SendUpdateModal({
  isOpen,
  onClose,
  projectId,
  clientEmails,
  kind,
  moduleId,
  featureId,
  contextLabel,
}: SendUpdateModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const sendEmail = useSendProjectEmail(projectId);

  useEffect(() => {
    if (isOpen) {
      setSelected(clientEmails);
      sendEmail.reset();
    }
    // Only reset when the modal opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const toggle = (email: string) =>
    setSelected((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email],
    );

  const result = sendEmail.data;
  const kindLabel = kind === 'MODULE' ? 'Module' : kind === 'FEATURE' ? 'Feature' : 'Project';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send project update"
      footer={
        result ? (
          <Button onClick={onClose}>Done</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose} disabled={sendEmail.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => sendEmail.mutate({ kind, moduleId, featureId, recipients: selected })}
              isLoading={sendEmail.isPending}
              disabled={selected.length === 0 || clientEmails.length === 0}
            >
              Send to {selected.length} {selected.length === 1 ? 'recipient' : 'recipients'}
            </Button>
          </>
        )
      }
    >
      {clientEmails.length === 0 ? (
        <p className="text-sm text-ink-muted">
          This client has no email addresses yet. Add one on the client&rsquo;s page, then you can
          send updates.
        </p>
      ) : result ? (
        <div className="space-y-2">
          {result.sent > 0 && (
            <p className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
              Sent to {result.sent} of {result.recipients.length} recipient
              {result.recipients.length === 1 ? '' : 's'}.
            </p>
          )}
          {result.failed > 0 && (
            <p className="rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
              {result.failed} email{result.failed === 1 ? '' : 's'} couldn&rsquo;t be sent — the
              email service may not be configured, or the send was rejected. Check the server logs
              for details.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">
            A progress update for{' '}
            <span className="font-medium text-ink">
              {kindLabel}: {contextLabel}
            </span>{' '}
            (with the current overall progress and module/feature status) will be emailed to the
            recipients you choose.
          </p>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
              Recipients
            </p>
            {clientEmails.map((email) => (
              <label
                key={email}
                className="flex cursor-pointer items-center gap-2.5 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-surface-hover"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(email)}
                  onChange={() => toggle(email)}
                  className="h-4 w-4 shrink-0 accent-emerald-600"
                />
                <span className="break-all font-mono text-ink">{email}</span>
              </label>
            ))}
          </div>
          {sendEmail.isError && (
            <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              {isApiError(sendEmail.error) ? sendEmail.error.message : 'Failed to send.'}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
