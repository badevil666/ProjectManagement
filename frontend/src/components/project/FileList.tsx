import type { Module, ProjectFile } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime, formatFileSize } from '@/utils/format';

interface FileListProps {
  files: ProjectFile[];
  modules?: Pick<Module, 'id' | 'title'>[];
  readOnly: boolean;
  downloadingFileId?: string | null;
  deletingFileId?: string | null;
  onDownload: (file: ProjectFile) => void;
  onDelete?: (file: ProjectFile) => void;
}

function FileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3 12.75h6.75m-6.75 3h6.75M6.75 21H12"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 2.25v3.75c0 .621.504 1.125 1.125 1.125h3.75M6.75 21a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 016.75 3h6.879a2.25 2.25 0 011.591.659l4.121 4.121A2.25 2.25 0 0120 9.371V18.75A2.25 2.25 0 0117.75 21H6.75z"
      />
    </svg>
  );
}

export function FileList({
  files,
  modules = [],
  readOnly,
  downloadingFileId,
  deletingFileId,
  onDownload,
  onDelete,
}: FileListProps) {
  if (files.length === 0) {
    return <EmptyState title="No files uploaded yet" className="py-6" />;
  }

  const moduleTitle = (moduleId?: string | null) => {
    if (!moduleId) return null;
    return modules.find((m) => m.id === moduleId)?.title;
  };

  const sorted = [...files].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <ul className="divide-y divide-border rounded-md border border-border">
      {sorted.map((file) => (
        <li key={file.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-alt text-ink-muted">
            <FileIcon />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{file.name}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-subtle">
              <span className="font-mono tabular-nums">{formatFileSize(file.size)}</span>
              <span>&middot;</span>
              <span className="font-mono tabular-nums">{formatDateTime(file.createdAt)}</span>
              {moduleTitle(file.moduleId) && (
                <>
                  <span>&middot;</span>
                  <span className="rounded-full border border-border bg-surface-alt px-2 py-0.5 font-medium text-ink-muted">
                    {moduleTitle(file.moduleId)}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => onDownload(file)}
              disabled={downloadingFileId === file.id}
              className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-ink-muted hover:bg-surface-hover hover:text-ink disabled:opacity-60"
            >
              {downloadingFileId === file.id ? 'Downloading…' : 'Download'}
            </button>
            {!readOnly && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(file)}
                disabled={deletingFileId === file.id}
                className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-ink-muted hover:bg-red-500/10 hover:text-red-600 disabled:opacity-60 dark:hover:text-red-400"
              >
                Delete
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
