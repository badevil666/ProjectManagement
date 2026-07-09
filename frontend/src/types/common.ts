// Shared envelope shapes used across every endpoint in API_CONTRACT.md.

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorBody {
  message: string;
  code?: string;
  details?: unknown;
}

/** Shape of every non-2xx JSON response body. */
export interface ApiErrorResponse {
  error: ApiErrorBody;
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
}
