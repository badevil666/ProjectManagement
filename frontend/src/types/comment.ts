import type { AuthorType } from './enums';

export interface Comment {
  id: string;
  projectId: string;
  authorType: AuthorType;
  authorName: string;
  message: string;
  createdAt: string;
}

/** Admin posting a comment on a project. */
export interface CommentInput {
  message: string;
}

/** Client posting a comment via a share link — no auth, just a display name. */
export interface ShareCommentInput {
  authorName: string;
  message: string;
}
