export interface ShareLink {
  id: string;
  projectId: string;
  token: string;
  expiresAt?: string | null;
  revoked: boolean;
  accessCount: number;
  lastAccessedAt?: string | null;
  createdBy?: string | null;
  createdAt: string;
}

export interface ShareLinkCreateInput {
  expiresAt?: string;
}

export interface ShareLinkCreateResponse {
  shareLink: ShareLink;
  /** Full client-facing path, e.g. "/share/abc123...". */
  url: string;
}
