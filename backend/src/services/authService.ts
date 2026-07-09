import type { IUserRepository } from '../repositories/userRepository';
import { UnauthorizedError } from '../utils/AppError';
import { signToken } from '../utils/jwt';
import { comparePassword } from '../utils/password';
import { serializeUser, type UserDTO } from './serializers/userSerializer';

export interface LoginResult {
  token: string;
  user: UserDTO;
}

export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(email.toLowerCase().trim());
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatches = await comparePassword(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = signToken({ sub: user.id, email: user.email, name: user.name, role: user.role });
    return { token, user: serializeUser(user) };
  }

  async getProfile(userId: string): Promise<UserDTO> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    return serializeUser(user);
  }
}
