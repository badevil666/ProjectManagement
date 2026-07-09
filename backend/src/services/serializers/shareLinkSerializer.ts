import type { ShareLink } from '@prisma/client';

export function shareLinkPath(token: string): string {
  return `/share/${token}`;
}

export function serializeShareLink(shareLink: ShareLink) {
  const now = new Date();
  const expired = Boolean(shareLink.expiresAt && shareLink.expiresAt < now);
  return {
    id: shareLink.id,
    projectId: shareLink.projectId,
    token: shareLink.token,
    url: shareLinkPath(shareLink.token),
    expiresAt: shareLink.expiresAt,
    revoked: shareLink.revoked,
    active: !shareLink.revoked && !expired,
    accessCount: shareLink.accessCount,
    lastAccessedAt: shareLink.lastAccessedAt,
    createdBy: shareLink.createdBy,
    createdAt: shareLink.createdAt,
  };
}
