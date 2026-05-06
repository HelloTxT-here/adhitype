import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeName = 'serika-dark' | 'carbon' | 'cyberpunk' | 'lavender' | 'matrix' | 'nord' | 'strawberry';

export interface Theme {
  name: ThemeName;
  bg: string;
  main: string;
  sub: string;
  caret: string;
  text: string;
  error: string;
}

export const themes: Record<ThemeName, Theme> = {
  'serika-dark': {
    name: 'serika-dark',
    bg: '#323437',
    main: '#e2b714',
    sub: '#646669',
    caret: '#e2b714',
    text: '#d1d0c5',
    error: '#ca4754',
  },
  'carbon': {
    name: 'carbon',
    bg: '#313131',
    main: '#f66e0d',
    sub: '#616161',
    caret: '#f66e0d',
    text: '#f5e1d5',
    error: '#da3333',
  },
  'cyberpunk': {
    name: 'cyberpunk',
    bg: '#181c18',
    main: '#00ff8c',
    sub: '#ff0055',
    caret: '#00ff8c',
    text: '#00ccff',
    error: '#ff0055',
  },
  'lavender': {
    name: 'lavender',
    bg: '#121212',
    main: '#c6aeda',
    sub: '#6a6a6a',
    caret: '#c6aeda',
    text: '#e6e6e6',
    error: '#f6a6b2',
  },
  'matrix': {
    name: 'matrix',
    bg: '#000000',
    main: '#15ff00',
    sub: '#003b00',
    caret: '#15ff00',
    text: '#008f11',
    error: '#ff0000',
  },
  'nord': {
    name: 'nord',
    bg: '#2e3440',
    main: '#88c0d0',
    sub: '#4c566a',
    caret: '#88c0d0',
    text: '#d8dee9',
    error: '#bf616a',
  },
  'strawberry': {
    name: 'strawberry',
    bg: '#191919',
    main: '#ff6666',
    sub: '#444444',
    caret: '#ff6666',
    text: '#ffffff',
    error: '#ff1a1a',
  }
};

interface CustomSettings {
  fontFamily: 'mono' | 'sans' | 'serif';
  fontSize: number;
  caretStyle: 'line' | 'block' | 'underline';
  smoothCaret: boolean;
  blindMode: boolean;
  showWpm: boolean;
  showAccuracy: boolean;
  showTimer: boolean;
  confidenceMode: boolean;
  freedomMode: boolean;
  difficulty: 'normal' | 'expert' | 'master';
  soundVolume: number;
  soundType: 'none' | 'mechanical' | 'clicky' | 'pop';
  quickRestart: boolean;
  highlightCurrentWord: boolean;
  hideExtraLetters: boolean;
  outOfFocusWarning: boolean;
  capsLockWarning: boolean;
  stopOnError: 'off' | 'letter' | 'word';
  caretColor: 'text' | 'main' | 'error' | 'sub';
  errorBeep: boolean;
}

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (name: ThemeName) => void;
  settings: CustomSettings;
  updateSettings: (newSettings: Partial<CustomSettings>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    return (localStorage.getItem('theme') as ThemeName) || 'serika-dark';
  });

  const [settings, setSettings] = useState<CustomSettings>(() => {
    const saved = localStorage.getItem('settings');
    const defaultSettings: CustomSettings = {
      fontFamily: 'mono',
      fontSize: 32,
      caretStyle: 'line',
      smoothCaret: true,
      blindMode: false,
      showWpm: true,
      showAccuracy: false,
      showTimer: true,
      confidenceMode: false,
      freedomMode: false,
      difficulty: 'normal',
      soundVolume: 0.5,
      soundType: 'none',
      quickRestart: true,
      highlightCurrentWord: true,
      hideExtraLetters: false,
      outOfFocusWarning: true,
      capsLockWarning: true,
      stopOnError: 'off',
      caretColor: 'main',
      errorBeep: false,
    };
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('theme', themeName);
    const theme = themes[themeName];
    
    // Apply theme colors to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--color-bg', theme.bg);
    root.style.setProperty('--color-main', theme.main);
    root.style.setProperty('--color-sub', theme.sub);
    root.style.setProperty('--color-caret', theme.caret);
    root.style.setProperty('--color-text', theme.text);
    root.style.setProperty('--color-error', theme.error);
    
    // Apply settings
    root.style.setProperty('--font-size', `${settings.fontSize}px`);
    
    if (settings.fontFamily === 'mono') {
      root.style.setProperty('--font-family', '"JetBrains Mono", monospace');
    } else if (settings.fontFamily === 'sans') {
      root.style.setProperty('--font-family', 'Inter, sans-serif');
    } else {
      root.style.setProperty('--font-family', '"Playfair Display", serif');
    }

  }, [themeName, settings]);

  const setTheme = (name: ThemeName) => setThemeName(name);

  const updateSettings = (newSettings: Partial<CustomSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('settings', JSON.stringify(updated));
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme: themes[themeName],
      setTheme,
      settings,
      updateSettings
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
