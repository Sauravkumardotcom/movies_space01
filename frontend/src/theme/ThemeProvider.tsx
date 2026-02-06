import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode, ThemeTokens, darkThemeTokens, lightThemeTokens } from './tokens';

interface ThemeContextType {
  mode: ThemeMode;
  tokens: ThemeTokens;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(true);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode | null;
    if (savedMode) {
      setModeState(savedMode);
    }
  }, []);

  // React to mode changes
  useEffect(() => {
    localStorage.setItem('theme-mode', mode);

    let resolvedIsDark = isDark;

    if (mode === 'system') {
      // Check system preference
      resolvedIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      resolvedIsDark = mode === 'dark';
    }

    setIsDark(resolvedIsDark);

    // Update HTML class for Tailwind
    if (resolvedIsDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }

    // Update CSS variables for themed colors
    const tokens = resolvedIsDark ? darkThemeTokens : lightThemeTokens;
    const root = document.documentElement;

    Object.entries(tokens.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    Object.entries(tokens.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
  }, [mode, isDark]);

  // Listen to system theme changes
  useEffect(() => {
    if (mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  const toggleTheme = () => {
    setMode(isDark ? 'light' : 'dark');
  };

  const tokens = isDark ? darkThemeTokens : lightThemeTokens;

  return (
    <ThemeContext.Provider value={{ mode, tokens, isDark, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
