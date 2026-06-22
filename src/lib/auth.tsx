import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { apiFetch, buildQuery, tokenStorage, ApiError } from './apiClient';

export interface User {
  id: string;
  phone: string | null;
  full_name: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

interface RequestCallResponse {
  request_id: string;
  phone_to_call: string;
}

interface CallStatusResponse {
  status: 'pending' | 'expired' | 'verified';
  token?: string;
  user?: User;
  is_new_user?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (updates: { full_name?: string; phone?: string | null; bio?: string | null; avatar_url?: string | null }) => Promise<{ error: string | null }>;
  updateAvatar: (file: File) => Promise<{ error: string | null }>;
  sendPhoneCode: (phone: string) => Promise<{ error: string | null; phoneToCall?: string }>;
  verifyPhoneCode: (phone: string, code: string) => Promise<{ error: string | null; isNewUser?: boolean }>;
  requestPhoneChange: (phone: string) => Promise<{ error: string | null; requestId?: string; phoneToCall?: string }>;
  verifyPhoneChange: (requestId: string) => Promise<{ error: string | null; status?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizePhone = (phone: string): string => phone.replace(/[^\d]/g, '');

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef<string | null>(null);

  // Восстановление сессии: если токен есть — подтягиваем профиль
  useEffect(() => {
    if (!tokenStorage.get()) {
      setLoading(false);
      return;
    }
    apiFetch<User>('/profile')
      .then(setUser)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) tokenStorage.clear();
      })
      .finally(() => setLoading(false));
  }, []);

  const signOut = useCallback(async () => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!tokenStorage.get()) return;
    try {
      const updated = await apiFetch<User>('/profile');
      setUser(updated);
    } catch {
      // ignore network errors silently
    }
  }, []);

  const updateProfile = useCallback(async (updates: { full_name?: string; phone?: string | null; bio?: string | null; avatar_url?: string | null }) => {
    try {
      const updated = await apiFetch<User>('/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setUser(updated);
      return { error: null };
    } catch {
      return { error: 'Ошибка при обновлении профиля' };
    }
  }, []);

  const updateAvatar = useCallback(async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { url } = await apiFetch<{ url: string }>('/photos/upload', { method: 'POST', body: formData });
      const updated = await apiFetch<User>('/profile', {
        method: 'PUT',
        body: JSON.stringify({ avatar_url: url }),
      });
      setUser(updated);
      return { error: null };
    } catch {
      return { error: 'Ошибка при загрузке фото' };
    }
  }, []);

  // Запрос звонка через GreenSMS: бэкенд возвращает номер, на который надо позвонить
  const sendPhoneCode = useCallback(async (phone: string) => {
    const normalizedPhone = normalizePhone(phone);

    if (normalizedPhone.length < 7 || normalizedPhone.length > 15) {
      return { error: 'Некорректный номер телефона' };
    }

    try {
      const data = await apiFetch<RequestCallResponse>('/auth/request_call', {
        method: 'POST',
        body: JSON.stringify({ phone: normalizedPhone }),
      });
      requestIdRef.current = data.request_id;
      return { error: null, phoneToCall: data.phone_to_call };
    } catch (err) {
      if (err instanceof ApiError) return { error: err.message };
      return { error: 'Ошибка сети: ' + (err instanceof Error ? err.message : String(err)) };
    }
  }, []);

  // Ожидание подтверждения звонка и авторизация (поллинг до ~3 минут)
  const verifyPhoneCode = useCallback(async (_phone: string, _code: string) => {
    const requestId = requestIdRef.current;
    if (!requestId) return { error: 'Сначала запросите звонок' };

    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const data = await apiFetch<CallStatusResponse>(`/auth/call_status${buildQuery({ request_id: requestId })}`);
        if (data.status === 'verified' && data.token && data.user) {
          requestIdRef.current = null;
          tokenStorage.set(data.token);
          setUser(data.user);
          return { error: null, isNewUser: data.is_new_user ?? false };
        }
        if (data.status === 'expired') {
          requestIdRef.current = null;
          return { error: 'Время подтверждения истекло. Запросите звонок ещё раз.' };
        }
        // pending — продолжаем поллинг
      } catch {
        // сетевая ошибка — продолжаем поллинг
      }
    }

    return { error: 'Время ожидания истекло. Позвоните на номер для подтверждения и попробуйте снова.' };
  }, []);

  const requestPhoneChange = useCallback(async (phone: string) => {
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length < 7 || normalizedPhone.length > 15) {
      return { error: 'Некорректный номер телефона' };
    }
    try {
      const data = await apiFetch<{ request_id: string; phone_to_call: string }>('/auth/request_phone_change', {
        method: 'POST',
        body: JSON.stringify({ phone: normalizedPhone }),
      });
      return { error: null, requestId: data.request_id, phoneToCall: data.phone_to_call };
    } catch (err) {
      if (err instanceof ApiError) return { error: err.message };
      return { error: 'Ошибка сети: ' + (err instanceof Error ? err.message : String(err)) };
    }
  }, []);

  const verifyPhoneChange = useCallback(async (requestId: string) => {
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const data = await apiFetch<{ status: string; user?: User }>(`/auth/phone_change_status?request_id=${requestId}`);
        if (data.status === 'verified' && data.user) {
          setUser(data.user);
          return { error: null, status: 'verified' };
        }
        if (data.status === 'expired') {
          return { error: 'Время подтверждения истекло. Запросите звонок ещё раз.', status: 'expired' };
        }
      } catch {
        // сетевая ошибка — продолжаем поллинг
      }
    }
    return { error: 'Время ожидания истекло. Позвоните на номер для подтверждения и попробуйте снова.', status: 'expired' };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser, updateProfile, updateAvatar, sendPhoneCode, verifyPhoneCode, requestPhoneChange, verifyPhoneChange }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
