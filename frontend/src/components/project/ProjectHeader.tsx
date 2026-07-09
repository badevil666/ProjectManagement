import type { ProjectPriority, ProjectStatus } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/utils/format';

interface ProjectHeaderProps {
  title: string;
  description?: string | null;
  client: { companyName: string; contactPerson: string };
  status: ProjectStatus;
  priority: ProjectPriority;
  overallProgress: number;
  budget?: string | null;
  currency: string;
  startDate?: string | null;
  expectedEndDate?: string | null;
  actualEndDate?: string | null;
  readOnly?: boolean;
  onEdit?: () => void;
}

export function ProjectHeader({
  title,
  description,
  client,
  status,
  priority,
  overallProgress,
  budget,
  currency,
  startDate,
  expectedEndDate,
  actualEndDate,
  readOnly = false,
  onEdit,
}: ProjectHeaderProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
            <StatusBadge status={status} />
            <PriorityBadge priority={priority} />
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            {client.companyName} &middot; {client.contactPerson}
          </p>
          {description && <p className="mt-2 max-w-2xl text-sm text-ink-muted">{description}</p>}
        </div>
        {!readOnly && onEdit && (
          <Button variant="secondary" size="sm" onClick={onEdit}>
            Edit project
          </Button>
        )}
      </div>

      <div className="mt-5">
        <div className="mb-1 flex items-center justify-between text-xs text-ink-muted">
          <span>Overall progress</span>
          <span className="font-mono font-medium tabular-nums text-ink">{overallProgress}%</span>
        </div>
        <ProgressBar value={overallProgress} />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-subtle">Budget</dt>
          <dd className="mt-0.5 font-mono text-sm font-medium tabular-nums text-ink">
            {formatCurrency(budget, currency)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-subtle">Start date</dt>
          <dd className="mt-0.5 font-mono text-sm font-medium tabular-nums text-ink">
            {formatDate(startDate)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-subtle">Expected end</dt>
          <dd className="mt-0.5 font-mono text-sm font-medium tabular-nums text-ink">
            {formatDate(expectedEndDate)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-subtle">Actual end</dt>
          <dd className="mt-0.5 font-mono text-sm font-medium tabular-nums text-ink">
            {formatDate(actualEndDate)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
