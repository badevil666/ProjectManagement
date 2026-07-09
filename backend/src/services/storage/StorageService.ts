import type { Readable } from 'stream';

export interface StoredFile {
  /** Opaque key the storage backend uses to locate the object later. */
  key: string;
  /** Reference URL/path — informational only; downloads always go through the API. */
  url: string;
  size: number;
}

export interface SaveFileParams {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

/**
 * Storage abstraction so the rest of the app never talks to the filesystem
 * (or S3/R2/etc.) directly. `LocalStorageService` is the only implementation
 * for this MVP, but an `S3StorageService`/`R2StorageService` could satisfy
 * this same interface later without any caller changes.
 */
export interface StorageService {
  save(params: SaveFileParams): Promise<StoredFile>;
  getReadStream(key: string): Readable;
  delete(key: string): Promise<void>;
}
