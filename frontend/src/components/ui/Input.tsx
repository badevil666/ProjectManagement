import { forwardRef, useId, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...rest }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-md border bg-surface-alt px-3 py-2 text-sm text-ink placeholder:text-ink-subtle
            focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent
            disabled:cursor-not-allowed disabled:opacity-60
            ${error ? 'border-red-500' : 'border-border'} ${className}`}
          {...rest}
        />
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        {!error && hint && <p className="text-xs text-ink-subtle">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
