import { Outlet } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-2.386l1.591-1.591M3 12h2.25m.386-6.364l1.591 1.591M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 008.998-5.998z"
      />
    </svg>
  );
}

/** Minimal header, no nav — used for the public /share/:token route where
 * clients (who never log in) view read-only project progress. */
export function PublicLayout() {
  const { theme, toggle } = useTheme();

  return (
    <div className="flex min-h-screen flex-col bg-app text-ink">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-app px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-fg">
            CP
          </div>
          <span className="text-sm font-semibold tracking-tight text-ink">Client Portal</span>
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle dark mode"
          className="rounded-md p-2 text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
