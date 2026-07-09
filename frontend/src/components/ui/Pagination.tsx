import type { PaginationMeta } from '@/types';
import { Button } from './Button';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, totalPages, total, limit } = meta;
  if (totalPages <= 1) return null;

  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(total, page * limit);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
      <p className="text-xs text-ink-muted">
        Showing <span className="font-mono tabular-nums text-ink">{rangeStart}</span>–
        <span className="font-mono tabular-nums text-ink">{rangeEnd}</span> of{' '}
        <span className="font-mono tabular-nums text-ink">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <span className="text-xs text-ink-muted">
          Page <span className="font-mono tabular-nums text-ink">{page}</span> of{' '}
          <span className="font-mono tabular-nums text-ink">{totalPages}</span>
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
