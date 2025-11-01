// src/context/SettingsContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext();

const themes = {
  default: {
    light: { background: '#d3c5c5ff',text: '#222222', },
    dark: { background: '#121212',  text: '#f0f0f0',   },
  },
  ocean: {
    light: { background: '#d0f0ff', text: '#003366' },
    dark: { background: '#001f33', text: '#66ccff' },
  },
  sunset: {
    light: { background: '#ffd6a5', text: '#ff4500' },
    dark: { background: '#331a00', text: '#ff9966' },
  },
  forest: {
    light: { background: '#d2f8d2', text: '#004d00' },
    dark: { background: '#001a00', text: '#66ff66' },
  },
 neon: {
  light: { 
    background: '#eaffea',      // soft mint base
    text: '#00cc44',            // bright neon green text
    accent: '#ff00cc',          // pink neon accent
  },
  dark: { 
    background: '#9da89dff',      // almost black for neon glow
    text: '#39ff14',            // classic electric green
    accent: '#ff0099',          // pink-magenta accent
  },
},

  halloween: {
    background: '#000000',
    text: '#FF7518',
  },
  christmas: {
    background: '#004d00',
    text: '#FFFFFF',
  },
};

export const SettingsProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [appearance, setAppearance] = useState('System');
  const [dataSaver, setDataSaver] = useState(false);

  const getTheme = () => {
    const t = themes[currentTheme];
    if (currentTheme === 'halloween' || currentTheme === 'christmas') return t;
    return darkMode ? t.dark : t.light;
  };

  const theme = getTheme();

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedDarkMode = await AsyncStorage.getItem('darkMode');
        const storedTheme = await AsyncStorage.getItem('currentTheme');
        const storedAppearance = await AsyncStorage.getItem('appearance');
        const storedDataSaver = await AsyncStorage.getItem('dataSaver');

        if (storedDarkMode !== null) setDarkMode(JSON.parse(storedDarkMode));
        if (storedTheme !== null) setCurrentTheme(storedTheme);
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
    AsyncStorage.setItem('currentTheme', currentTheme);
    AsyncStorage.setItem('appearance', appearance);
    AsyncStorage.setItem('dataSaver', JSON.stringify(dataSaver));
  }, [darkMode, currentTheme, appearance, dataSaver]);

  const resetSettings = async () => {
    setDarkMode(false);
    setCurrentTheme('default');
    setAppearance('System');
    setDataSaver(false);
    await AsyncStorage.multiRemove(['darkMode', 'currentTheme', 'appearance', 'dataSaver']);
  };

  return (
    <SettingsContext.Provider
      value={{
        darkMode,
        setDarkMode,
        currentTheme,
        setCurrentTheme,
        appearance,
        setAppearance,
        dataSaver,
        setDataSaver,
        resetSettings,
        theme,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
