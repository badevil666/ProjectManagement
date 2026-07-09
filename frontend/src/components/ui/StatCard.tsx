import type { ReactNode } from 'react';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: 'default' | 'brand' | 'success' | 'warning' | 'danger';
}

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'bg-surface-alt text-ink-muted',
  brand: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export function StatCard({ label, value, icon, tone = 'default' }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4 px-5 py-4">
      {icon && (
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm text-ink-muted">{label}</p>
        <p className="font-mono text-2xl font-semibold tracking-tight tabular-nums text-ink">
          {value}
        </p>
      </div>
    </Card>
  );
}
