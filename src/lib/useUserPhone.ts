import { useState, useEffect } from 'react';
import { useAuth } from './auth';
import { supabase } from './supabase';

export const useUserPhone = (): string => {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('phone')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        const resolved = data?.phone || user.phone || '';
        if (resolved) setPhone(resolved);
      });
  }, [user?.id]);

  return phone;
};
