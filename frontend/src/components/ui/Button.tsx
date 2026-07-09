import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  // The signature Vercel CTA: an inverted-ink surface (soft-white on black text
  // in dark, near-black on white text in light), dimming slightly on hover.
  primary:
    'bg-primary text-primary-fg hover:opacity-90 focus-visible:outline-accent disabled:hover:opacity-100',
  // Transparent with a hairline border and muted text; fills to a faint surface
  // and brightens its text on hover.
  secondary:
    'bg-transparent text-ink-muted border border-border hover:bg-surface-hover hover:text-ink focus-visible:outline-accent',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-500 disabled:hover:bg-red-600',
  ghost:
    'bg-transparent text-ink-muted hover:bg-surface-hover hover:text-ink focus-visible:outline-accent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className = '',
      children,
      ...rest
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center rounded-md font-medium transition-colors
          disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2
          focus-visible:outline-offset-2 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...rest}
      >
        {isLoading && <Spinner size="sm" />}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
