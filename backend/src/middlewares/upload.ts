import multer from 'multer';
import { MAX_UPLOAD_SIZE_BYTES } from '../config/constants';

/**
 * Multer stages the uploaded file in memory (not on disk) — the
 * StorageService is responsible for actually persisting it, so this stays
 * swappable between local disk / S3 / R2 without touching route code.
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
});
