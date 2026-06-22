import { useAuth } from './auth';

export const useUserPhone = (): string => {
  const { user } = useAuth();
  return user?.phone ?? '';
};
