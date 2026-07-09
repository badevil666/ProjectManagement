import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import type { Readable } from 'stream';
import type { SaveFileParams, StorageService, StoredFile } from './StorageService';

export class LocalStorageService implements StorageService {
  private readonly rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = path.resolve(rootDir);
    fs.mkdirSync(this.rootDir, { recursive: true });
  }

  async save({ buffer, originalName }: SaveFileParams): Promise<StoredFile> {
    const ext = path.extname(originalName);
    const key = `${randomBytes(16).toString('hex')}${ext}`;
    const fullPath = this.resolveSafePath(key);
    await fs.promises.writeFile(fullPath, buffer);
    return { key, url: `/uploads/${key}`, size: buffer.length };
  }

  getReadStream(key: string): Readable {
    const fullPath = this.resolveSafePath(key);
    return fs.createReadStream(fullPath);
  }

  async delete(key: string): Promise<void> {
    const fullPath = this.resolveSafePath(key);
    await fs.promises.rm(fullPath, { force: true });
  }

  /** Prevents path traversal outside the configured upload root. */
  private resolveSafePath(key: string): string {
    const fullPath = path.resolve(this.rootDir, key);
    if (!fullPath.startsWith(this.rootDir + path.sep) && fullPath !== this.rootDir) {
      throw new Error(`Invalid storage key: ${key}`);
    }
    return fullPath;
  }
}
