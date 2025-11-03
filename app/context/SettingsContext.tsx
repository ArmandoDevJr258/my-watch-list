// src/context/SettingsContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext();

const themes = {
  default: {
    light: { background: '#d3c5c5ff', text: '#222222' },
    dark: { background: '#121212', text: '#f0f0f0' },
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
    light: { background: '#eaffea', text: '#00cc44', accent: '#ff00cc' },
    dark: { background: '#0f0f0f', text: '#39ff14', accent: '#ff0099' },
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

const fonts = [
  'System',
  'Roboto',
  'Montserrat',
  'Lobster',
  'OpenSans',
  'Oswald',
  'Pacifico',
  'Raleway',
  'Ubuntu',
  'CourierNew',
];

export const SettingsProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [currentFont, setCurrentFont] = useState('System');
  const [appearance, setAppearance] = useState('System');
  const [dataSaver, setDataSaver] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // ✅ Avoid premature save overwriting load

  const getTheme = () => {
    const t = themes[currentTheme] || themes.default;
    if (currentTheme === 'halloween' || currentTheme === 'christmas') return t;
    return darkMode ? t.dark : t.light;
  };

  const theme = getTheme();

  // ✅ Load settings from AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedDarkMode = await AsyncStorage.getItem('darkMode');
        const storedTheme = await AsyncStorage.getItem('currentTheme');
        const storedFont = await AsyncStorage.getItem('currentFont');
        const storedAppearance = await AsyncStorage.getItem('appearance');
        const storedDataSaver = await AsyncStorage.getItem('dataSaver');

        if (storedDarkMode !== null) setDarkMode(JSON.parse(storedDarkMode));
        if (storedTheme !== null) setCurrentTheme(storedTheme);
        if (storedFont !== null) setCurrentFont(storedFont);
        if (storedAppearance !== null) setAppearance(storedAppearance);
        if (storedDataSaver !== null) setDataSaver(JSON.parse(storedDataSaver));
      } catch (e) {
        console.log('⚠️ Failed to load settings:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadSettings();
  }, []);

  // ✅ Only save after settings have finished loading
  useEffect(() => {
    if (!isLoaded) return;
    const saveSettings = async () => {
      try {
        await AsyncStorage.multiSet([
          ['darkMode', JSON.stringify(darkMode)],
          ['currentTheme', currentTheme],
          ['currentFont', currentFont],
          ['appearance', appearance],
          ['dataSaver', JSON.stringify(dataSaver)],
        ]);
      } catch (e) {
        console.log('⚠️ Failed to save settings:', e);
      }
    };
    saveSettings();
  }, [darkMode, currentTheme, currentFont, appearance, dataSaver, isLoaded]);

  // ✅ Reset all settings
  const resetSettings = async () => {
    try {
      await AsyncStorage.multiRemove([
        'darkMode',
        'currentTheme',
        'currentFont',
        'appearance',
        'dataSaver',
      ]);
      setDarkMode(false);
      setCurrentTheme('default');
      setCurrentFont('System');
      setAppearance('System');
      setDataSaver(false);
    } catch (e) {
      console.log('⚠️ Failed to reset settings:', e);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        darkMode,
        setDarkMode,
        currentTheme,
        setCurrentTheme,
        currentFont,
        setCurrentFont,
        fonts,
        appearance,
        setAppearance,
        dataSaver,
        setDataSaver,
        resetSettings,
        theme,
        themes,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
