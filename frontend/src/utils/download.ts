/** Trigger a browser "Save As" for an in-memory Blob (used for authenticated
 * file downloads, where we cannot rely on a plain <a href> since the request
 * needs an Authorization header attached by the Axios interceptor). */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
