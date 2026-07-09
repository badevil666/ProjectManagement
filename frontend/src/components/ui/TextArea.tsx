import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, hint, id, className = '', rows = 3, ...rest }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          aria-invalid={Boolean(error)}
          className={`w-full resize-y rounded-md border bg-surface-alt px-3 py-2 text-sm text-ink placeholder:text-ink-subtle
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
TextArea.displayName = 'TextArea';
