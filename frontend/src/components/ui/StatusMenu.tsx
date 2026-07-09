import { useEffect, useRef, useState } from 'react';
import { humanizeEnum } from '@/utils/format';
import { statusDotClass, type AnyStatus } from './StatusBadge';
import { CheckIcon, ChevronDownIcon } from './icons';

interface StatusMenuProps<T extends AnyStatus> {
  value: T;
  options: readonly T[];
  disabled?: boolean;
  onChange: (value: T) => void;
  ariaLabel?: string;
}

/**
 * A Geist-styled status dropdown that replaces the native <select> — shows the
 * current status as a colored dot + label and opens a small menu of options,
 * each with its status color. Closes on outside-click, Escape, or selection.
 */
export function StatusMenu<T extends AnyStatus>({
  value,
  options,
  disabled = false,
  onChange,
  ariaLabel,
}: StatusMenuProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-alt/60 py-1 pl-2 pr-1.5 text-xs font-medium text-ink transition-colors hover:bg-surface-hover focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${statusDotClass(value)}`} />
        <span>{humanizeEnum(value)}</span>
        <ChevronDownIcon
          className={`h-3.5 w-3.5 text-ink-subtle transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-30 mt-1 min-w-[11rem] overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-overlay"
        >
          {options.map((option) => {
            const selected = option === value;
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors hover:bg-surface-hover ${
                  selected ? 'text-ink' : 'text-ink-muted'
                }`}
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${statusDotClass(option)}`} />
                <span className="flex-1">{humanizeEnum(option)}</span>
                {selected && <CheckIcon className="h-3.5 w-3.5 text-accent" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
