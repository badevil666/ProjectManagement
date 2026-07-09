// Single source of truth for persisting the admin JWT + user profile in
// localStorage. Used by both AuthContext (React state) and the Axios
// interceptor (services/api/client.ts), which cannot use React context
// since it runs outside the component tree.
import type { User } from '@/types';

const TOKEN_KEY = 'client-portal-token';
const USER_KEY = 'client-portal-user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
