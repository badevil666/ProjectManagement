import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { LoginRequest } from '@/types';

export function useLogin() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (body: LoginRequest) => authApi.login(body),
    onSuccess: (data) => {
      login(data.token, data.user);
    },
  });
}
