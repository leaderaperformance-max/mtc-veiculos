import React, { createContext, useContext, useState, useEffect } from 'react';

interface FavoritesContextType {
  favoriteList: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteList, setFavoriteList] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('@veiculos-favorites');
    if (saved) {
      try {
        setFavoriteList(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse favorites list', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('@veiculos-favorites', JSON.stringify(favoriteList));
  }, [favoriteList]);

  const toggleFavorite = (id: string) => {
    setFavoriteList(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isFavorite = (id: string) => favoriteList.includes(id);

  const clearFavorites = () => setFavoriteList([]);

  return (
    <FavoritesContext.Provider value={{ favoriteList, toggleFavorite, isFavorite, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
