import rateLimit from 'express-rate-limit';
import { SHARE_RATE_LIMIT_MAX, SHARE_RATE_LIMIT_WINDOW_MS } from '../config/constants';

/** Blunts share-link token brute-forcing/guessing on all public /api/share/* routes. */
export const shareRateLimiter = rateLimit({
  windowMs: SHARE_RATE_LIMIT_WINDOW_MS,
  limit: SHARE_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: { message: 'Too many requests, please try again later.', code: 'RATE_LIMITED' },
  },
});
