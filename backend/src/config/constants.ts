export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

export const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const SHARE_TOKEN_BYTES = 32; // 32+ bytes of entropy per spec

export const SHARE_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const SHARE_RATE_LIMIT_MAX = 100; // requests per IP per window across all /api/share/* routes
