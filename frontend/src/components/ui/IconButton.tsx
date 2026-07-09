interface IconButtonProps {
  title: string;
  label: string;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

/** A small square icon-only button used for row actions (reorder/edit/delete). */
export function IconButton({ title, label, disabled, danger, onClick, children }: IconButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`rounded p-1 text-ink-subtle transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? 'hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400'
          : 'hover:bg-surface-hover hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}
