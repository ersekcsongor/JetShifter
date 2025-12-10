// ~/contexts/ThemeContext.tsx - DEBUG VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  colors: typeof lightColors;
}

const lightColors = {
  background: '#ffff',
  surface: '#ffffff',
  primary: '#fdc57b',
  primaryDark: '#6B5B00',
  text: '#000000',
  textSecondary: '#666666',
  border: '#E0E0E0',
  iconColor: '#333333',
};

const darkColors = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#FFD700',
  primaryDark: '#FFC700',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#333333',
  iconColor: '#FFFFFF',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');
  const [forceUpdate, setForceUpdate] = useState(0);

  // DEBUG: Log system color scheme changes
  useEffect(() => {
    console.log('=== THEME DEBUG ===');
    console.log('System Color Scheme:', systemColorScheme);
    console.log('Platform:', Platform.OS);
    console.log('Selected Theme:', theme);
    console.log('Force Update Counter:', forceUpdate);
    console.log('==================');
  }, [systemColorScheme, theme, forceUpdate]);

  useEffect(() => {
    loadTheme();
  }, []);

  // DEBUG: Listen to app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      console.log('App State Changed:', nextAppState);
      console.log('System Theme:', systemColorScheme);
    });

    return () => {
      subscription.remove();
    };
  }, [systemColorScheme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      console.log('Loaded theme from storage:', savedTheme);
      if (savedTheme) {
        setThemeState(savedTheme as Theme);
      } else {
        console.log('No saved theme, using system default');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      console.log('Setting new theme:', newTheme);
      await AsyncStorage.setItem('theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const effectiveTheme = theme === 'system' 
    ? (systemColorScheme || 'light')
    : theme;

  const colors = effectiveTheme === 'dark' ? darkColors : lightColors;

  // DEBUG: Log effective theme
  console.log('Effective Theme:', effectiveTheme);
  console.log('Using colors for:', effectiveTheme);

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};