// context/FavoritesContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem('@favorites');
        if (stored) setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    };
    loadFavorites();
  }, []);

  // Save favorites to AsyncStorage whenever it changes
  useEffect(() => {
    AsyncStorage.setItem('@favorites', JSON.stringify(favorites)).catch(e =>
      console.error('Failed to save favorites', e)
    );
  }, [favorites]);

  // Add show to favorites
  const addToFavorites = (show) => {
    if (!favorites.find(item => item.id === show.id)) {
      setFavorites([...favorites, show]);
    }
  };

  // Remove show from favorites
  const removeFromFavorites = (id) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };

  // Check if a show is in favorites
  const isFavorite = (id) => favorites.some(item => item.id === id);

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
