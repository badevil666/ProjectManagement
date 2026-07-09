import type { FeaturePriority, ProjectPriority } from '@/types';
import { humanizeEnum } from '@/utils/format';

export type AnyPriority = ProjectPriority | FeaturePriority;

// Quiet, low-saturation rounded-full pills matching StatusBadge: a faint tint
// fill + matching hairline border + muted text. LOW is a plain neutral pill.
const PRIORITY_STYLES: Record<AnyPriority, string> = {
  LOW: 'bg-surface-alt text-ink-muted border-border',
  MEDIUM: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
  HIGH: 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400',
  URGENT: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
};

interface PriorityBadgeProps {
  priority: AnyPriority;
  className?: string;
}

export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[priority]} ${className}`}
    >
      {humanizeEnum(priority)}
    </span>
  );
}
