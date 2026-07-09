import axios, { type AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types';
import { clearStoredAuth, getStoredToken } from '@/services/authStorage';
import { ApiError } from './apiError';

// When VITE_API_URL isn't set at build time, fall back to something that
// actually works for whichever build produced the bundle:
// - `vite dev` (import.meta.env.DEV): there's no reverse proxy in front of
//   the dev server, so we must hit the backend's own port directly.
// - a production build (docker-compose): nginx (see nginx.conf) proxies
//   same-origin "/api/*" to the backend service, and docker-compose.yml
//   intentionally passes no VITE_API_URL build arg, so the bundle must call
//   the relative path for that proxy to ever be hit.
const DEFAULT_BASE_URL = import.meta.env.DEV ? 'http://localhost:4000/api' : '/api';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || DEFAULT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Paths that must never trigger an auth-driven redirect to /login: the
 * login call itself (its 401 is a normal "wrong password" response the
 * Login page needs to render inline) and every public /share/* call
 * (unauthenticated by design — a 401 there is not "you got logged out"). */
function isExemptFromAuthRedirect(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes('/auth/login') || url.includes('/share/');
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<Partial<ApiErrorResponse>>) => {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.error?.message;
    const code = error.response?.data?.error?.code;
    const details = error.response?.data?.error?.details;

    const message =
      serverMessage ||
      (status
        ? `Request failed with status ${status}`
        : error.message || 'Network error — please check your connection.');

    if (status === 401 && !isExemptFromAuthRedirect(error.config?.url)) {
      clearStoredAuth();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(new ApiError(message, status, code, details));
  },
);
