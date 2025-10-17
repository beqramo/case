import { Meal } from '@/types/meal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const FAVORITES_STORAGE_KEY = '@meal_market_favorites';

interface FavoritesContextType {
  favorites: Meal[];
  addFavorite: (meal: Meal) => Promise<void>;
  removeFavorite: (mealId: string) => Promise<void>;
  isFavorite: (mealId: string) => boolean;
  toggleFavorite: (meal: Meal) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Meal[]>([]);

  const loadFavorites = useCallback(async () => {
    try {
      console.log('💾 Loading favorites from storage...');
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(parsed);
        console.log(`✅ Loaded ${parsed.length} favorite(s) from storage`);
      } else {
        console.log('📭 No favorites found in storage');
      }
    } catch (error) {
      console.error('❌ Error loading favorites:', error);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const saveFavorites = useCallback(async (newFavorites: Meal[]) => {
    try {
      console.log(`💾 Saving ${newFavorites.length} favorite(s) to storage...`);
      await AsyncStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(newFavorites),
      );
      setFavorites(newFavorites);
      console.log('✅ Favorites saved successfully');
    } catch (error) {
      console.error('❌ Error saving favorites:', error);
    }
  }, []);

  const addFavorite = useCallback(
    async (meal: Meal) => {
      const newFavorites = [...favorites, meal];
      await saveFavorites(newFavorites);
    },
    [favorites, saveFavorites],
  );

  const removeFavorite = useCallback(
    async (mealId: string) => {
      const newFavorites = favorites.filter((m) => m.idMeal !== mealId);
      await saveFavorites(newFavorites);
    },
    [favorites, saveFavorites],
  );

  const isFavorite = useCallback(
    (mealId: string) => {
      return favorites.some((m) => m.idMeal === mealId);
    },
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (meal: Meal) => {
      if (isFavorite(meal.idMeal)) {
        await removeFavorite(meal.idMeal);
      } else {
        await addFavorite(meal);
      }
    },
    [isFavorite, removeFavorite, addFavorite],
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
      }}>
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
