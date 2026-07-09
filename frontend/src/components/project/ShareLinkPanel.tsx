import { useState } from 'react';
import type { ShareLink } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/utils/format';

interface ShareLinkPanelProps {
  shareLinks: ShareLink[];
  isCreating?: boolean;
  revokingId?: string | null;
  onCreate: (expiresAt?: string) => void;
  onRevoke: (id: string) => void;
}

function shareUrlFor(token: string): string {
  return `${window.location.origin}/share/${token}`;
}

function isExpired(shareLink: ShareLink): boolean {
  return Boolean(shareLink.expiresAt && new Date(shareLink.expiresAt).getTime() < Date.now());
}

export function ShareLinkPanel({
  shareLinks,
  isCreating = false,
  revokingId,
  onCreate,
  onRevoke,
}: ShareLinkPanelProps) {
  const [expiresAt, setExpiresAt] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = () => {
    onCreate(expiresAt ? new Date(expiresAt).toISOString() : undefined);
    setExpiresAt('');
  };

  const handleCopy = async (shareLink: ShareLink) => {
    const url = shareUrlFor(shareLink.token);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(shareLink.id);
      setTimeout(() => setCopiedId((current) => (current === shareLink.id ? null : current)), 2000);
    } catch {
      window.prompt('Copy this link', url);
    }
  };

  const sorted = [...shareLinks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            label="Expires at (optional)"
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>
        <Button onClick={handleCreate} isLoading={isCreating}>
          Generate link
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="No share links yet"
          description="Generate one to give the client read-only access."
        />
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {sorted.map((shareLink) => {
            const expired = isExpired(shareLink);
            const revoked = shareLink.revoked;
            return (
              <li key={shareLink.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="truncate font-mono text-xs tabular-nums text-ink-muted">
                      {shareUrlFor(shareLink.token)}
                    </code>
                    {revoked ? (
                      <span className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                        Revoked
                      </span>
                    ) : expired ? (
                      <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                        Expired
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-ink-subtle">
                    <span className="font-mono tabular-nums">{shareLink.accessCount}</span> view
                    {shareLink.accessCount === 1 ? '' : 's'} &middot; last accessed{' '}
                    <span className="font-mono tabular-nums">
                      {formatDateTime(shareLink.lastAccessedAt)}
                    </span>{' '}
                    &middot; expires{' '}
                    <span className="font-mono tabular-nums">
                      {shareLink.expiresAt ? formatDateTime(shareLink.expiresAt) : 'never'}
                    </span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleCopy(shareLink)}>
                    {copiedId === shareLink.id ? 'Copied!' : 'Copy link'}
                  </Button>
                  {!revoked && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onRevoke(shareLink.id)}
                      isLoading={revokingId === shareLink.id}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
