import type { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface ResolvedShareLink {
  id: string;
  projectId: string;
  token: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      shareLink?: ResolvedShareLink;
    }
  }
}

export {};
