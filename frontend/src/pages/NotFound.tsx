import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-app px-4 text-center text-ink">
      <p className="font-mono text-6xl font-semibold tabular-nums tracking-tight text-ink-subtle">
        404
      </p>
      <h1 className="text-lg font-semibold tracking-tight text-ink">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/">
        <Button>Go home</Button>
      </Link>
    </div>
  );
}
