import { apiFetch, buildQuery } from './apiClient';

export const uploadPhoto = async (file: File, _folder: string): Promise<string> => {
  const form = new FormData();
  form.append('file', file);
  const { url } = await apiFetch<{ url: string }>('/photos/upload', {
    method: 'POST',
    body: form,
  });
  return url;
};

export const deletePhoto = async (url: string): Promise<void> => {
  try {
    await apiFetch(`/photos${buildQuery({ url })}`, { method: 'DELETE' });
  } catch {
    // удаление фото некритично — игнорируем ошибку
  }
};
