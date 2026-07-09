import type { User } from '@prisma/client';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

/** Never includes passwordHash — matches API_CONTRACT.md `user` shape exactly. */
export function serializeUser(user: User): UserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}
