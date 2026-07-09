import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLogin } from '@/hooks/useLogin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isApiError } from '@/services/api/apiError';

export function Login() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLogin();

  if (isAuthenticated) {
    const from = (location.state as { from?: { pathname: string } } | null)?.from;
    return <Navigate to={from?.pathname ?? '/dashboard'} replace />;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    loginMutation.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => navigate('/dashboard', { replace: true }),
      },
    );
  };

  const errorMessage = loginMutation.isError
    ? isApiError(loginMutation.error)
      ? loginMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-4 text-ink">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-fg">
            CP
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-ink">Client Portal</h1>
          <p className="text-sm text-ink-muted">Sign in to manage your projects</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {errorMessage && (
            <p
              role="alert"
              className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
            >
              {errorMessage}
            </p>
          )}
          <Button type="submit" className="w-full" isLoading={loginMutation.isPending}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
