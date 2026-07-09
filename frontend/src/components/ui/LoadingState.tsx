import { Spinner } from './Spinner';

export function LoadingState({
  label = 'Loading…',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 px-6 py-12 text-center ${className}`}
    >
      <Spinner size="lg" className="text-ink-muted" />
      <p className="text-sm text-ink-muted">{label}</p>
    </div>
  );
}
