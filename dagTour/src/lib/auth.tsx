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
  // Phone auth методы
  sendPhoneCode: (phone: string) => Promise<{ error: string | null }>;
  verifyPhoneCode: (phone: string, code: string) => Promise<{ error: string | null; isNewUser?: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Получаем текущую сессию
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Слушаем изменения авторизации
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
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { error: getErrorMessage(error.message) };
    }

    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: getErrorMessage(error.message) };
    }

    return { error: null };
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
      .update({
        full_name: updates.full_name,
        phone: updates.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      return { error: 'Ошибка при обновлении профиля' };
    }

    return { error: null };
  }, [user]);

  // Нормализация телефона
  const normalizePhone = (phone: string): string => {
    return phone.replace(/[^\d]/g, '');
  };

  // Отправка кода на телефон через SMS Gorod
  const sendPhoneCode = useCallback(async (phone: string) => {
    const normalizedPhone = normalizePhone(phone);
    
    if (normalizedPhone.length < 7 || normalizedPhone.length > 15) {
      return { error: 'Некорректный номер телефона' };
    }

    // Проверяем, не отправляли ли недавно код
    const { data: recentCode } = await supabase
      .from('otp_codes')
      .select('id')
      .eq('phone', normalizedPhone)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (recentCode) {
      return { error: 'Код уже был отправлен. Подождите 5 минут.' };
    }

    // Генерируем код
    const code = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Определяем текст SMS в зависимости от страны
    const isCisPhone = (phoneNum: string): boolean => {
      const cleaned = normalizePhone(phoneNum);
      const cisCodes = ["370", "371", "372", "373", "374", "375", "380", "992", "993", "994", "995", "996", "998", "398"];
      const code = cleaned.startsWith("7") || cleaned.startsWith("8") ? "7" : 
                   cisCodes.find(c => cleaned.startsWith(c)) || "";
      return cisCodes.includes(code) || code === "7";
    };

    const textPrefix = isCisPhone(normalizedPhone) ? "as-salam.ru: Ваш код " : "as-salam.ru: Your code is ";
    const codeStr = code.toString();
    const formattedCode = `${codeStr.slice(0, 3)}-${codeStr.slice(3)}`;
    const message = textPrefix + formattedCode;

    // Пробуем отправить через SMS Gorod API
    const apiKey = import.meta.env.VITE_SMS_GOROD_API_KEY;
    
    if (apiKey) {
      // Форматируем номер телефона - добавляем + если нет
      const phoneForSms = normalizedPhone.startsWith('+') ? normalizedPhone : '+' + normalizedPhone;
      
      console.log('Sending SMS:', { phone: phoneForSms, text: message, apiKey: apiKey ? 'present' : 'missing' });
      
      try {
        const response = await fetch("https://new.smsgorod.ru/apiSms/create", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: apiKey,
            sms: [{
              channel: "char",
              phone: phoneForSms,
              text: message,
              sender: "VIRTA",
            }],
          }),
        });

        const responseText = await response.text();
        console.log('SMS Gorod response:', response.status, responseText);

        if (!response.ok) {
          console.error('SMS Gorod error:', response.status, responseText);
          return { error: 'Ошибка отправки SMS' };
        }
        
        // Проверим ответ на ошибки
        try {
          const responseData = JSON.parse(responseText);
          if (responseData.error) {
            console.error('SMS Gorod API error:', responseData.error);
            return { error: 'Ошибка отправки SMS: ' + responseData.error };
          }
        } catch (e) {
          // Не JSON - значит всё ок
        }
      } catch (err) {
        console.error('SMS send error:', err);
        return { error: 'Ошибка сети при отправке SMS' };
      }
    } else {
      // Нет API ключа - режим разработки, просто логируем код
      console.log(`🔐 SMS Code for ${normalizedPhone}: ${code} (API key not configured)`);
    }

    // Сохраняем код в БД
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({
        phone: normalizedPhone,
        code: code,
        context: 'auth',
        used: false,
        expires_at: expiresAt,
      });

    if (insertError) {
      return { error: 'Ошибка при сохранении кода' };
    }

    return { error: null };
  }, []);

  // Проверка кода и авторизация
  const verifyPhoneCode = useCallback(async (phone: string, code: string) => {
    const normalizedPhone = normalizePhone(phone);
    const codeNumber = parseInt(code.replace(/\D/g, ''), 10);

    if (isNaN(codeNumber) || codeNumber < 100000 || codeNumber > 999999) {
      return { error: 'Введите 6-значный код' };
    }

    // Проверяем код в кастомной таблице
    const { data: otpRecord, error: otpLookupError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', normalizedPhone)
      .eq('code', codeNumber)
      .eq('context', 'auth')
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (otpLookupError || !otpRecord) {
      return { error: 'Неверный или истёкший код' };
    }

    // Помечаем код как использованный
    await supabase
      .from('otp_codes')
      .update({ used: true })
      .eq('id', otpRecord.id);

    // Ищем существующего пользователя по телефону
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    if (existingProfile) {
      // Пользователь существует - создаём сессию через Admin API
      const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
      
      if (serviceRoleKey) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/admin/users/${existingProfile.id}/sessions`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
              },
            }
          );

          if (response.ok) {
            const sessionData = await response.json();
            await supabase.auth.setSession({
              access_token: sessionData.access_token,
              refresh_token: sessionData.refresh_token,
            });
            return { error: null, isNewUser: false };
          }
        } catch (err) {
          console.error('Error creating session:', err);
        }
      }
      
      return { error: null, isNewUser: false };
    }

    // Новый пользователь - создаём аккаунт
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    
    if (serviceRoleKey) {
      try {
        // Получаем следующий номер пользователя
        const { data: nextNumberData } = await supabase.rpc('get_next_user_number');
        const nextNumber = (nextNumberData || 0) + 1;
        const userName = `User #${nextNumber}`;

        // Создаём пользователя через Admin API
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/admin/users`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
            },
            body: JSON.stringify({
              phone: normalizedPhone,
              phone_confirm: true,
              user_metadata: {
                phone: normalizedPhone,
                full_name: userName,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Admin user creation error:', errorData);
          return { error: 'Не удалось создать пользователя' };
        }

        const userData = await response.json();
        
        // Создаём сессию для нового пользователя
        const sessionResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/admin/users/${userData.id}/sessions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
            },
          }
        );

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          await supabase.auth.setSession({
            access_token: sessionData.access_token,
            refresh_token: sessionData.refresh_token,
          });
        }

        return { error: null, isNewUser: true };
      } catch (error) {
        console.error('Error creating user:', error);
        return { error: 'Ошибка при создании пользователя' };
      }
    }

    return { error: 'Настройте SERVICE_ROLE_KEY для авторизации по телефону', isNewUser: false };
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

// Вспомогательная функция для перевода ошибок
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
