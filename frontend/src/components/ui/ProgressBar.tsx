interface ProgressBarProps {
  value: number;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

function toneForValue(value: number): string {
  if (value >= 100) return 'bg-emerald-500';
  if (value > 0) return 'bg-accent';
  return 'bg-ink-subtle';
}

export function ProgressBar({
  value,
  size = 'md',
  showLabel = false,
  className = '',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`w-full overflow-hidden rounded-full bg-surface-hover ${size === 'sm' ? 'h-1' : 'h-1.5'}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all ${toneForValue(clamped)}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-ink-muted">
          {clamped}%
        </span>
      )}
    </div>
  );
}
