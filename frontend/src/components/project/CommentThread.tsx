import { useState, type FormEvent } from 'react';
import type { Comment } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/utils/format';

interface CommentThreadProps {
  comments: Comment[];
  mode: 'admin' | 'client';
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSubmitAdmin?: (message: string) => void;
  onSubmitClient?: (authorName: string, message: string) => void;
}

export function CommentThread({
  comments,
  mode,
  isSubmitting = false,
  errorMessage,
  onSubmitAdmin,
  onSubmitClient,
}: CommentThreadProps) {
  const [authorName, setAuthorName] = useState('');
  const [message, setMessage] = useState('');

  const sorted = [...comments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    if (mode === 'admin') {
      onSubmitAdmin?.(message.trim());
    } else {
      if (!authorName.trim()) return;
      onSubmitClient?.(authorName.trim(), message.trim());
    }
    setMessage('');
  };

  return (
    <div className="space-y-4">
      {sorted.length === 0 ? (
        <EmptyState title="No comments yet" className="py-6" />
      ) : (
        <ul className="space-y-3">
          {sorted.map((comment) => (
            <li key={comment.id} className="rounded-md border border-border bg-surface-alt/40 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink">{comment.authorName}</span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                      comment.authorType === 'ADMIN'
                        ? 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {comment.authorType === 'ADMIN' ? 'Developer' : 'Client'}
                  </span>
                </div>
                <time
                  className="font-mono text-xs tabular-nums text-ink-subtle"
                  dateTime={comment.createdAt}
                >
                  {formatDateTime(comment.createdAt)}
                </time>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink">{comment.message}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 border-t border-border pt-4">
        {mode === 'client' && (
          <Input
            label="Your name"
            required
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Jane Doe"
          />
        )}
        <TextArea
          label="Comment"
          required
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write an update or question…"
        />
        {errorMessage && <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>}
        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={!message.trim() || (mode === 'client' && !authorName.trim())}
          >
            Post comment
          </Button>
        </div>
      </form>
    </div>
  );
}
