import { supabase } from './supabase';

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

export const dbFavorites = {
  getAll: async (userId: string): Promise<FavoriteItem[]> => {
    const { data, error } = await supabase
      .from('favorites')
      .select('item_type, item_id')
      .eq('user_id', userId);
    if (error) return [];
    return data.map((row) => ({ type: row.item_type as FavoriteType, id: row.item_id as number }));
  },

  add: async (userId: string, item: FavoriteItem): Promise<void> => {
    await supabase.from('favorites').upsert(
      { user_id: userId, item_type: item.type, item_id: item.id },
      { onConflict: 'user_id,item_type,item_id' }
    );
  },

  remove: async (userId: string, type: FavoriteType, id: number): Promise<void> => {
    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('item_type', type)
      .eq('item_id', id);
  },

  migrate: async (userId: string, items: FavoriteItem[]): Promise<void> => {
    if (items.length === 0) return;
    const rows = items.map((item) => ({
      user_id: userId,
      item_type: item.type,
      item_id: item.id,
    }));
    await supabase
      .from('favorites')
      .upsert(rows, { onConflict: 'user_id,item_type,item_id' });
    localFavorites.clear();
  },
};
