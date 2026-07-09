/** Admin-scoped, authenticated file download route (see API_CONTRACT.md). */
export function fileDownloadUrl(fileId: string): string {
  return `/api/files/${fileId}/download`;
}

/** Public, share-token-scoped file download route. */
export function shareFileDownloadUrl(token: string, fileId: string): string {
  return `/api/share/${token}/files/${fileId}/download`;
}

/** Client-facing frontend path for a share link (not an API route). */
export function shareLinkFrontendPath(token: string): string {
  return `/share/${token}`;
}
