// src/context/SettingsContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [appearance, setAppearance] = useState('System');
  const [dataSaver, setDataSaver] = useState(false);

  const lightTheme = {
    background: '#d3c5c5ff',
    text: '#000000',
  };

  const darkTheme = {
    background: '#121212',
    text: '#FFFFFF',
  };

  const theme = darkMode ? darkTheme : lightTheme;

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedDarkMode = await AsyncStorage.getItem('darkMode');
        const storedAppearance = await AsyncStorage.getItem('appearance');
        const storedDataSaver = await AsyncStorage.getItem('dataSaver');

        if (storedDarkMode !== null) setDarkMode(JSON.parse(storedDarkMode));
        if (storedAppearance !== null) setAppearance(storedAppearance);
        if (storedDataSaver !== null) setDataSaver(JSON.parse(storedDataSaver));
      } catch (e) {
        console.log('Failed to load settings', e);
      }
    };
    loadSettings();
  }, []);

  // Save settings
  useEffect(() => {
    AsyncStorage.setItem('darkMode', JSON.stringify(darkMode));
    AsyncStorage.setItem('appearance', appearance);
    AsyncStorage.setItem('dataSaver', JSON.stringify(dataSaver));
  }, [darkMode, appearance, dataSaver]);

  const resetSettings = async () => {
    setDarkMode(false);
    setAppearance('System');
    setDataSaver(false);
    await AsyncStorage.multiRemove(['darkMode', 'appearance', 'dataSaver']);
  };

  return (
    <SettingsContext.Provider
      value={{
        darkMode,
        setDarkMode,
        appearance,
        setAppearance,
        dataSaver,
        setDataSaver,
        resetSettings,
        theme, // 👈 added theme colors
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
