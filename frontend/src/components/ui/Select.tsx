import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className = '', children, ...rest }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <select
          id={inputId}
          ref={ref}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-md border bg-surface-alt px-3 py-2 text-sm text-ink
            focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent
            disabled:cursor-not-allowed disabled:opacity-60
            ${error ? 'border-red-500' : 'border-border'} ${className}`}
          {...rest}
        >
          {children}
        </select>
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
