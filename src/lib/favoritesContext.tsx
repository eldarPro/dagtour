import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { FavoriteItem, FavoriteType, dbFavorites, localFavorites } from './favorites';
import { useAuth } from './auth';

interface FavoritesContextType {
  favorites: FavoriteItem[];
  isFavorited: (type: FavoriteType, id: number) => boolean;
  toggle: (type: FavoriteType, id: number) => Promise<void>;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  isFavorited: () => false,
  toggle: async () => {},
  loading: true,
});

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (user) {
      const local = localFavorites.get();
      dbFavorites.migrate(local).then(() => {
        dbFavorites.getAll().then((items) => {
          setFavorites(items);
          setLoading(false);
        });
      });
    } else {
      setFavorites(localFavorites.get());
      setLoading(false);
    }
  }, [user?.id]);

  const isFavorited = useCallback(
    (type: FavoriteType, id: number) => favorites.some((f) => f.type === type && f.id === id),
    [favorites]
  );

  const toggle = useCallback(
    async (type: FavoriteType, id: number) => {
      const active = favorites.some((f) => f.type === type && f.id === id);
      if (user) {
        if (active) {
          await dbFavorites.remove(type, id);
          setFavorites((prev) => prev.filter((f) => !(f.type === type && f.id === id)));
        } else {
          await dbFavorites.add({ type, id });
          setFavorites((prev) => [...prev, { type, id }]);
        }
      } else {
        if (active) {
          localFavorites.remove(type, id);
          setFavorites((prev) => prev.filter((f) => !(f.type === type && f.id === id)));
        } else {
          localFavorites.add({ type, id });
          setFavorites((prev) => [...prev, { type, id }]);
        }
      }
    },
    [user, favorites]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorited, toggle, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
