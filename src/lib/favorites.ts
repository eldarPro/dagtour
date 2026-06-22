import { apiFetch, buildQuery } from './apiClient';

export type FavoriteType = 'house' | 'car' | 'tour';

export interface FavoriteItem {
  type: FavoriteType;
  id: number;
}

const LS_KEY = 'dagtour_favorites';

export const localFavorites = {
  get: (): FavoriteItem[] => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as FavoriteItem[]) : [];
    } catch {
      return [];
    }
  },
  set: (items: FavoriteItem[]) => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  },
  add: (item: FavoriteItem) => {
    const items = localFavorites.get();
    if (!items.find((f) => f.type === item.type && f.id === item.id)) {
      localFavorites.set([...items, item]);
    }
  },
  remove: (type: FavoriteType, id: number) => {
    localFavorites.set(localFavorites.get().filter((f) => !(f.type === type && f.id === id)));
  },
  clear: () => {
    localStorage.removeItem(LS_KEY);
  },
};

// Избранное авторизованного пользователя — на бэкенде, пользователь определяется по JWT
export const dbFavorites = {
  getAll: async (): Promise<FavoriteItem[]> => {
    try {
      return await apiFetch<FavoriteItem[]>('/favorites');
    } catch {
      return [];
    }
  },

  add: async (item: FavoriteItem): Promise<void> => {
    await apiFetch('/favorites', {
      method: 'POST',
      body: JSON.stringify({ item_type: item.type, item_id: item.id }),
    }).catch(() => {});
  },

  remove: async (type: FavoriteType, id: number): Promise<void> => {
    await apiFetch(`/favorites${buildQuery({ item_type: type, item_id: id })}`, {
      method: 'DELETE',
    }).catch(() => {});
  },

  migrate: async (items: FavoriteItem[]): Promise<void> => {
    if (items.length === 0) return;
    await apiFetch('/favorites/migrate', {
      method: 'POST',
      body: JSON.stringify({ items: items.map((i) => ({ item_type: i.type, item_id: i.id })) }),
    });
    localFavorites.clear();
  },
};
