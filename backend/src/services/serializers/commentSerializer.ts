import type { Comment } from '@prisma/client';

export function serializeComment(comment: Comment) {
  return {
    id: comment.id,
    projectId: comment.projectId,
    authorType: comment.authorType,
    authorName: comment.authorName,
    message: comment.message,
    createdAt: comment.createdAt,
  };
}
