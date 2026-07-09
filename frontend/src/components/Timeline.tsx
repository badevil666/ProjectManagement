import type { ReactNode, SVGProps } from 'react';
import type { Activity, ActivityType } from '@/types';
import { formatDateTime, formatRelativeTime } from '@/utils/format';
import { EmptyState } from './ui/EmptyState';

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      {...props}
    />
  );
}

const ICONS: Record<ActivityType, ReactNode> = {
  PROJECT_CREATED: (
    <Icon strokeWidth={1.75} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </Icon>
  ),
  PROJECT_STATUS_CHANGED: (
    <Icon strokeWidth={1.75} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 3.75V6m0 0V8.25M16.5 6H4.5A2.25 2.25 0 002.25 8.25v10.5A2.25 2.25 0 004.5 21h10.5a2.25 2.25 0 002.25-2.25V15"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 9.75l-4.5 4.5-2.25-2.25" />
    </Icon>
  ),
  MODULE_CREATED: (
    <Icon strokeWidth={1.75} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 7.5h6l1.5 2.25h9v9a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V9a1.5 1.5 0 011.5-1.5z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v4.5m2.25-2.25H9.75" />
    </Icon>
  ),
  MODULE_COMPLETED: (
    <Icon strokeWidth={1.75} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75l1.5 1.5 3.75-3.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </Icon>
  ),
  FEATURE_CREATED: (
    <Icon strokeWidth={1.75} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v6m3-3H9m10.5 0a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
      />
    </Icon>
  ),
  FEATURE_COMPLETED: (
    <Icon strokeWidth={1.75} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </Icon>
  ),
  FILE_UPLOADED: (
    <Icon strokeWidth={1.75} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m-6 0V3.75A1.5 1.5 0 0110.5 2.25h3A1.5 1.5 0 0115 3.75v4.5m-6 0h6"
      />
    </Icon>
  ),
  COMMENT_ADDED: (
    <Icon strokeWidth={1.75} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 10.5h7.5m-7.5 3h4.5m4.5-9H4.5A2.25 2.25 0 002.25 6.75v9A2.25 2.25 0 004.5 18v3l4.5-3h9.75a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25z"
      />
    </Icon>
  ),
  SHARE_LINK_CREATED: (
    <Icon strokeWidth={1.75} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-9 3L20.25 3m0 0h-5.25m5.25 0v5.25"
      />
    </Icon>
  ),
  SHARE_LINK_REVOKED: (
    <Icon strokeWidth={1.75} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244M3 3l18 18"
      />
    </Icon>
  ),
};

// Quiet, low-saturation icon chips using the sanctioned palette (accent blue,
// emerald, amber, red) with neutral surface tokens for non-status events — no
// raw grays or off-palette hues.
const ICON_TONES: Record<ActivityType, string> = {
  PROJECT_CREATED: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
  PROJECT_STATUS_CHANGED: 'bg-surface-alt text-ink-muted',
  MODULE_CREATED: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
  MODULE_COMPLETED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  FEATURE_CREATED: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
  FEATURE_COMPLETED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  FILE_UPLOADED: 'bg-surface-alt text-ink-muted',
  COMMENT_ADDED: 'bg-surface-alt text-ink-muted',
  SHARE_LINK_CREATED: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  SHARE_LINK_REVOKED: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

interface TimelineProps {
  activities: Activity[];
  /** Optional extra content rendered per-entry (e.g. the project name on a
   * cross-project dashboard feed). */
  renderMeta?: (activity: Activity) => ReactNode;
  emptyMessage?: string;
}

export function Timeline({
  activities,
  renderMeta,
  emptyMessage = 'No activity yet.',
}: TimelineProps) {
  if (activities.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <ol className="relative space-y-5 pl-1">
      {activities.map((activity, index) => (
        <li key={activity.id} className="relative flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ICON_TONES[activity.type]}`}
            >
              {ICONS[activity.type]}
            </span>
            {index < activities.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <p className="text-sm text-ink">{activity.message}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-subtle">
              <time
                dateTime={activity.createdAt}
                title={formatDateTime(activity.createdAt)}
                className="font-mono tabular-nums text-ink-muted"
              >
                {formatRelativeTime(activity.createdAt)}
              </time>
              {renderMeta && <span>{renderMeta(activity)}</span>}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
