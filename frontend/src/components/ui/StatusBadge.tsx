import type { FeatureStatus, ModuleStatus, ProjectStatus } from '@/types';
import { humanizeEnum } from '@/utils/format';

export type AnyStatus = ProjectStatus | ModuleStatus | FeatureStatus;

// Centralized color mapping for every status value across Project, Module,
// and Feature — the one place enum -> color is decided, reused everywhere a
// status needs to be rendered. Vercel-style: quiet rounded-full pills — a
// faint tint fill + a matching hairline border + low-saturation text. Neutral
// / inactive states fall back to the plain surface tokens.
const STATUS_STYLES: Record<AnyStatus, string> = {
  PLANNING: 'bg-surface-alt text-ink-muted border-border',
  NOT_STARTED: 'bg-surface-alt text-ink-muted border-border',
  TODO: 'bg-surface-alt text-ink-muted border-border',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
  ON_HOLD: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
  BLOCKED: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
  COMPLETED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  CANCELLED: 'bg-surface-alt text-ink-subtle border-border',
};

// Solid dot color per status — for the status menu and feature rows, where a
// small filled dot reads more clearly than a full tinted pill.
const STATUS_DOT: Record<AnyStatus, string> = {
  PLANNING: 'bg-ink-subtle',
  NOT_STARTED: 'bg-ink-subtle',
  TODO: 'bg-ink-subtle',
  IN_PROGRESS: 'bg-blue-500',
  ON_HOLD: 'bg-amber-500',
  BLOCKED: 'bg-red-500',
  COMPLETED: 'bg-emerald-500',
  CANCELLED: 'bg-ink-subtle',
};

export function statusDotClass(status: AnyStatus): string {
  return STATUS_DOT[status];
}

interface StatusBadgeProps {
  status: AnyStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]} ${className}`}
    >
      {humanizeEnum(status)}
    </span>
  );
}
