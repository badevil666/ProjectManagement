/** Normalized error thrown for every failed API call, regardless of whether
 * the server returned the `{ error }` envelope or the request failed before
 * a response was ever received (network error, timeout, etc). */
export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status?: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}
