import type { Feature, FeatureStatus } from '@/types';
import { FEATURE_STATUSES } from '@/types';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { IconButton } from '@/components/ui/IconButton';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
} from '@/components/ui/icons';
import { humanizeEnum } from '@/utils/format';

interface FeatureRowProps {
  feature: Feature;
  readOnly: boolean;
  isFirst: boolean;
  isLast: boolean;
  isBusy?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: FeatureStatus) => void;
}

/** Next status in the To do → In progress → Completed → To do cycle. */
function nextStatus(current: FeatureStatus): FeatureStatus {
  const index = FEATURE_STATUSES.indexOf(current);
  return FEATURE_STATUSES[(index + 1) % FEATURE_STATUSES.length] ?? 'TODO';
}

export function FeatureRow({
  feature,
  readOnly,
  isFirst,
  isLast,
  isBusy = false,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  onStatusChange,
}: FeatureRowProps) {
  const isCompleted = feature.status === 'COMPLETED';

  return (
    <div className="group flex items-center gap-3 border-t border-border px-4 py-2.5 transition-colors first:border-t-0 hover:bg-surface-hover/40">
      {!readOnly && (
        <StatusCircle
          status={feature.status}
          disabled={isBusy}
          title={feature.title}
          onCycle={() => onStatusChange?.(nextStatus(feature.status))}
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`truncate text-sm font-medium ${
              isCompleted ? 'text-ink-muted line-through' : 'text-ink'
            }`}
          >
            {feature.title}
          </span>
          <span className="shrink-0">
            <PriorityBadge priority={feature.priority} />
          </span>
        </div>
        {feature.description && (
          <p className="mt-0.5 truncate text-xs text-ink-muted">{feature.description}</p>
        )}
      </div>

      {readOnly ? (
        <span className="shrink-0">
          <StatusBadge status={feature.status} />
        </span>
      ) : (
        <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100">
          <div className="hidden items-center gap-0.5 lg:flex">
            <IconButton
              title="Move up"
              label="Move feature up"
              disabled={isFirst || isBusy}
              onClick={onMoveUp}
            >
              <ArrowUpIcon className="h-4 w-4" />
            </IconButton>
            <IconButton
              title="Move down"
              label="Move feature down"
              disabled={isLast || isBusy}
              onClick={onMoveDown}
            >
              <ArrowDownIcon className="h-4 w-4" />
            </IconButton>
          </div>
          <IconButton title="Edit feature" label="Edit feature" onClick={onEdit}>
            <PencilIcon className="h-4 w-4" />
          </IconButton>
          <IconButton title="Delete feature" label="Delete feature" danger onClick={onDelete}>
            <TrashIcon className="h-4 w-4" />
          </IconButton>
        </div>
      )}
    </div>
  );
}

interface StatusCircleProps {
  status: FeatureStatus;
  disabled: boolean;
  title: string;
  onCycle: () => void;
}

/**
 * A single click-to-cycle control that both shows and sets a feature's status:
 * empty ring (To do) → amber dot (In progress) → green check (Completed).
 */
function StatusCircle({ status, disabled, title, onCycle }: StatusCircleProps) {
  const visual =
    status === 'COMPLETED'
      ? 'border-emerald-500 bg-emerald-500 text-white'
      : status === 'IN_PROGRESS'
        ? 'border-amber-500 text-transparent'
        : 'border-ink-subtle/50 text-transparent';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onCycle}
      title={`${title} — ${humanizeEnum(status)} (click to change)`}
      aria-label={`Status: ${humanizeEnum(status)}. Click to change.`}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors hover:border-emerald-500 disabled:opacity-50 ${visual}`}
    >
      {status === 'COMPLETED' ? (
        <CheckIcon className="h-3 w-3" />
      ) : status === 'IN_PROGRESS' ? (
        <span className="h-2 w-2 rounded-full bg-amber-500" />
      ) : null}
    </button>
  );
}
