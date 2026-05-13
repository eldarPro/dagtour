import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { full_name?: string; phone?: string }) => Promise<{ error: string | null }>;
  sendPhoneCode: (phone: string) => Promise<{ error: string | null }>;
  verifyPhoneCode: (phone: string, code: string) => Promise<{ error: string | null; isNewUser?: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error ? getErrorMessage(error.message) : null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? getErrorMessage(error.message) : null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const updateProfile = useCallback(async (updates: { full_name?: string; phone?: string }) => {
    if (!user) return { error: 'Не авторизован' };
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    return { error: error ? 'Ошибка при обновлении профиля' : null };
  }, [user]);

  const normalizePhone = (phone: string): string => phone.replace(/[^\d]/g, '');

  // Отправка кода через Flash Call (VoicePassword)
  const sendPhoneCode = useCallback(async (phone: string) => {
    const normalizedPhone = normalizePhone(phone);

    if (normalizedPhone.length < 7 || normalizedPhone.length > 15) {
      return { error: 'Некорректный номер телефона' };
    }

    const apiKey = import.meta.env.VITE_ZVONOK_API_KEY;
    const campaignId = import.meta.env.VITE_ZVONOK_CAMPAIGN_ID;

    if (!apiKey) {
      console.log(`🔐 Dev mode — simulating zvonok confirm for ${normalizedPhone}`);
      return { error: null };
    }

    try {
      const base = import.meta.env.DEV ? '/zvonok-proxy' : 'https://zvonok.com';
      const url = `${base}/manager/cabapi_external/api/v1/phones/confirm/?campaign_id=${campaignId}&phone=%2B${normalizedPhone}&public_key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      console.log('Zvonok confirm:', data);
      if (data.status !== 'ok') {
        return { error: 'Ошибка сервиса: ' + JSON.stringify(data.data) };
      }
      return { error: null };
    } catch (err) {
      return { error: 'Ошибка сети: ' + (err instanceof Error ? err.message : String(err)) };
    }
  }, []);

  // Ожидание подтверждения звонка на +7 800 555-86-07 и авторизация
  const verifyPhoneCode = useCallback(async (phone: string, _code: string) => {
    const normalizedPhone = normalizePhone(phone);
    const apiKey = import.meta.env.VITE_ZVONOK_API_KEY;
    const campaignId = import.meta.env.VITE_ZVONOK_CAMPAIGN_ID;

    if (apiKey) {
      const base = import.meta.env.DEV ? '/zvonok-proxy' : 'https://zvonok.com';
      let confirmed = false;

      for (let i = 0; i < 60 && !confirmed; i++) {
        await new Promise(r => setTimeout(r, 3000));
        try {
          const url = `${base}/manager/cabapi_external/api/v1/phones/calls_by_phone/?campaign_id=${campaignId}&phone=%2B${normalizedPhone}&public_key=${apiKey}`;
          const resp = await fetch(url);
          const data = await resp.json();
          console.log('Zvonok status:', data);
          if (Array.isArray(data) && data.length > 0) {
            const status = (data[0].call_status || data[0].status || '').toLowerCase();
            if (['success', 'done', 'answrd', 'completed', 'pincode_ok'].includes(status)) {
              confirmed = true;
            } else if (status && !['in_process', 'queued', 'enroute', 'acceptd', ''].includes(status)) {
              return { error: 'Звонок не выполнен. Попробуйте ещё раз.' };
            }
          }
        } catch {
          // continue polling
        }
      }

      if (!confirmed) {
        return { error: 'Время ожидания истекло. Позвоните на +7 800 555-86-07 и попробуйте снова.' };
      }
    }

    // Создаём/находим пользователя и сессию через Edge Function (service role key на сервере)
    try {
      const { data, error: fnError } = await supabase.functions.invoke('phone-auth', {
        body: { phone: normalizedPhone },
      });

      if (fnError || !data?.hashed_token) {
        return { error: data?.error || fnError?.message || 'Ошибка авторизации' };
      }

      const { error: otpError } = await supabase.auth.verifyOtp({
        token_hash: data.hashed_token,
        type: 'email',
      });

      if (otpError) {
        return { error: 'Ошибка входа: ' + otpError.message };
      }

      return { error: null, isNewUser: data.isNewUser ?? false };
    } catch (err) {
      console.error('phone-auth function error:', err);
      return { error: 'Ошибка при авторизации' };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, updateProfile, sendPhoneCode, verifyPhoneCode }}>
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

function getErrorMessage(message: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Неверный email или пароль',
    'Email not confirmed': 'Подтвердите email перед входом',
    'User already registered': 'Пользователь с таким email уже существует',
    'Password should be at least 6 characters': 'Пароль должен содержать минимум 6 символов',
    'Invalid email': 'Некорректный email',
  };
  return errorMap[message] || message;
}
