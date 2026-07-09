import { useState } from 'react';
import type { Feature, FeatureStatus, ModuleStatus, ModuleWithFeatures } from '@/types';
import { MODULE_STATUSES } from '@/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusMenu } from '@/components/ui/StatusMenu';
import { IconButton } from '@/components/ui/IconButton';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
} from '@/components/ui/icons';
import { getModuleCompletion } from '@/utils/progress';
import { FeatureList } from './FeatureList';

interface ModuleCardProps {
  module: ModuleWithFeatures;
  readOnly: boolean;
  isFirst: boolean;
  isLast: boolean;
  isBusy?: boolean;
  busyFeatureId?: string | null;
  defaultExpanded?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: ModuleStatus) => void;
  onAddFeature?: () => void;
  onEditFeature?: (feature: Feature) => void;
  onDeleteFeature?: (feature: Feature) => void;
  onFeatureStatusChange?: (feature: Feature, status: FeatureStatus) => void;
  onReorderFeatures?: (order: string[]) => void;
}

export function ModuleCard({
  module,
  readOnly,
  isFirst,
  isLast,
  isBusy = false,
  busyFeatureId,
  defaultExpanded = true,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  onStatusChange,
  onAddFeature,
  onEditFeature,
  onDeleteFeature,
  onFeatureStatusChange,
  onReorderFeatures,
}: ModuleCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const completion = getModuleCompletion(module);
  const completedCount = module.features.filter((f) => f.status === 'COMPLETED').length;

  return (
    <div className="group/module overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-col gap-2.5 px-4 py-3 lg:flex-row lg:items-center lg:gap-3">
        <div className="flex min-w-0 items-center gap-3 lg:flex-1">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            aria-label={expanded ? `Collapse ${module.title}` : `Expand ${module.title}`}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-ink-subtle transition-colors hover:bg-surface-hover hover:text-ink"
          >
            <ChevronRightIcon
              className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
            />
          </button>

          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="min-w-0 flex-1 text-left"
          >
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-ink">{module.title}</h3>
              {readOnly ? (
                <span className="shrink-0">
                  <StatusBadge status={module.status} />
                </span>
              ) : null}
            </div>
            {module.description && (
              <p className="truncate text-xs text-ink-muted">{module.description}</p>
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 pl-9 lg:flex-nowrap lg:pl-0">
          <div className="flex min-w-[7rem] flex-1 flex-col items-end gap-1 lg:w-36 lg:flex-none">
            <div className="flex w-full items-center gap-2">
              <ProgressBar value={completion} size="sm" className="flex-1" />
              <span className="shrink-0 font-mono text-xs tabular-nums text-ink">
                {completion}%
              </span>
            </div>
            <span className="text-[11px] text-ink-subtle">
              <span className="font-mono tabular-nums">
                {completedCount}/{module.features.length}
              </span>{' '}
              features
            </span>
          </div>

          {!readOnly && (
            <>
              <StatusMenu
                value={module.status}
                options={MODULE_STATUSES}
                disabled={isBusy}
                ariaLabel={`Set status for ${module.title}`}
                onChange={(status) => onStatusChange?.(status)}
              />
              <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity lg:opacity-0 lg:group-focus-within/module:opacity-100 lg:group-hover/module:opacity-100">
                <div className="hidden items-center gap-0.5 lg:flex">
                  <IconButton
                    title="Move up"
                    label="Move module up"
                    disabled={isFirst || isBusy}
                    onClick={onMoveUp}
                  >
                    <ArrowUpIcon className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    title="Move down"
                    label="Move module down"
                    disabled={isLast || isBusy}
                    onClick={onMoveDown}
                  >
                    <ArrowDownIcon className="h-4 w-4" />
                  </IconButton>
                </div>
                <IconButton title="Edit module" label="Edit module" onClick={onEdit}>
                  <PencilIcon className="h-4 w-4" />
                </IconButton>
                <IconButton title="Delete module" label="Delete module" danger onClick={onDelete}>
                  <TrashIcon className="h-4 w-4" />
                </IconButton>
              </div>
            </>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4">
          <FeatureList
            features={module.features}
            readOnly={readOnly}
            busyFeatureId={busyFeatureId}
            onAddFeature={onAddFeature}
            onEditFeature={onEditFeature}
            onDeleteFeature={onDeleteFeature}
            onStatusChange={onFeatureStatusChange}
            onReorder={onReorderFeatures}
          />
        </div>
      )}
    </div>
  );
}
