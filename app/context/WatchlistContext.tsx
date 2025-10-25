// context/WatchlistContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    const loadWatchlist = async () => {
      try {
        const stored = await AsyncStorage.getItem('@watchlist');
        if (stored) setWatchlist(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load watchlist', e);
      }
    };
    loadWatchlist();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('@watchlist', JSON.stringify(watchlist)).catch(e =>
      console.error('Failed to save watchlist', e)
    );
  }, [watchlist]);

  const addToWatchlist = (show) => {
    if (!watchlist.find((item) => item.id === show.id)) {
      setWatchlist([...watchlist, show]);
    }
  };

  const removeFromWatchlist = (id) => {
    setWatchlist(watchlist.filter((item) => item.id !== id));
  };

  const isInWatchlist = (id) => watchlist.some((item) => item.id === id);

  return (
    <WatchlistContext.Provider
      value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => useContext(WatchlistContext);
