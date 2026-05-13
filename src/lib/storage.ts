import { supabase } from './supabase';

const BUCKET = 'announcement-photos';

export const uploadPhoto = async (file: File, folder: string): Promise<string> => {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

export const deletePhoto = async (url: string): Promise<void> => {
  try {
    const marker = `/object/public/${BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const path = url.slice(idx + marker.length);
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // удаление фото некритично — игнорируем ошибку
  }
};
