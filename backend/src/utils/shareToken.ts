import { randomBytes } from 'crypto';
import { SHARE_TOKEN_BYTES } from '../config/constants';

/**
 * Generates a cryptographically secure, unguessable share-link token:
 * `SHARE_TOKEN_BYTES` (32+) bytes of real entropy from `crypto.randomBytes`,
 * base64url-encoded. Never a UUID, never Math.random, never derived from
 * the project id.
 */
export function generateShareToken(): string {
  return randomBytes(SHARE_TOKEN_BYTES).toString('base64url');
}
