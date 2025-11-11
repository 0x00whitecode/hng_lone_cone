import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { StatusBarStyle } from 'react-native';
import { AppColors, DarkColors, LightColors } from '../constants/colors';

type ThemeContextType = {
  isDark: boolean;
  setIsDark: (v: boolean) => void;
  colors: AppColors;
  statusBarStyle: StatusBarStyle;
};

const STORAGE_KEY = '@settings_dark_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await SecureStore.getItemAsync(STORAGE_KEY);
        if (saved !== null) {
          setIsDark(saved === 'true');
        }
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    SecureStore.setItemAsync(STORAGE_KEY, isDark ? 'true' : 'false').catch(() => {});
  }, [isDark]);

  const value = useMemo<ThemeContextType>(() => {
    const colors = isDark ? DarkColors : LightColors;
    return {
      isDark,
      setIsDark,
      colors,
      statusBarStyle: isDark ? 'light-content' : 'dark-content',
    };
  }, [isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};


