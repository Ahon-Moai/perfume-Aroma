import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'monochrome-ivory' | 'burgundy-romance' | 'forest-luxe';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const THEMES: ThemeOption[] = [
  {
    id: 'monochrome-ivory',
    name: 'Monochrome Ivory',
    colors: {
      primary: '#111111',
      secondary: '#FFFFFF',
      accent: '#F2EEE5',
    },
  },
  {
    id: 'burgundy-romance',
    name: 'Burgundy Romance',
    colors: {
      primary: '#650F25',
      secondary: '#A52A43',
      accent: '#E8D6D1',
    },
  },
  {
    id: 'forest-luxe',
    name: 'Forest Luxe',
    colors: {
      primary: '#183B32',
      secondary: '#718675',
      accent: '#E5E9DF',
    },
  },
];

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: ThemeOption[];
  currentTheme: ThemeOption;
}

const STORAGE_KEY = 'storefront_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
      if (saved && (saved === 'monochrome-ivory' || saved === 'burgundy-romance' || saved === 'forest-luxe')) {
        return saved;
      }
    }
    return 'monochrome-ivory';
  });

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
