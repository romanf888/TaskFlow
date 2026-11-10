import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeColor = 'google-blue' | 'google-green' | 'google-red' | 'google-yellow' | 'google-purple';
export type ThemeMode = 'system' | 'light' | 'dark' | 'liquid-glass';
export type SurfaceTheme = 'liquid-glass' | 'google-dark' | 'eclipse-dark' | 'material-light';
export type BorderRadiusStyle = 'extra' | 'standard' | 'minimal';
export type DisplayDensity = 'comfortable' | 'compact';
export type DefaultSort = 'manual' | 'priority' | 'date-desc' | 'date-asc';

export interface UserPreferences {
  themeMode: ThemeMode; // 'system' (par défaut), 'light', 'dark', 'liquid-glass'
  surfaceTheme: SurfaceTheme;
  themeColor: ThemeColor;
  borderRadius: BorderRadiusStyle;
  density: DisplayDensity;
  autoMoveDoneTasks: boolean;
  confirmDelete: boolean;
  showImageThumbnails: boolean;
  showSubtaskProgress: boolean;
  defaultSort: DefaultSort;
  autoSaveLocalInterval: boolean;
  compactSidebar: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  themeMode: 'system', // Par défaut sur système
  surfaceTheme: 'liquid-glass', // iOS 27 Liquid Glass par défaut pour l'esthétique Apple
  themeColor: 'google-blue',
  borderRadius: 'extra', // Apple Squircle extra rounded
  density: 'compact', // Par défaut plus compact pour afficher un maximum de tâches
  autoMoveDoneTasks: true,
  confirmDelete: true,
  showImageThumbnails: true,
  showSubtaskProgress: true,
  defaultSort: 'manual',
  autoSaveLocalInterval: true,
  compactSidebar: false,
};

const PREFS_STORAGE_KEY = 'taskflow_user_preferences_v3';

interface SettingsContextType {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  resetPreferences: () => void;
  accentColorHex: string;
  accentBgHex: string;
  effectiveTheme: 'light' | 'dark' | 'liquid-glass';
  isLiquidGlass: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  getRoundedClass: (element: 'card' | 'container' | 'pill' | 'button' | 'modal') => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const THEME_COLOR_MAP: Record<ThemeColor, { name: string; hex: string; bgHex: string; borderHex: string }> = {
  'google-blue': { name: 'Apple Bleu', hex: '#007AFF', bgHex: 'rgba(0, 122, 255, 0.15)', borderHex: 'rgba(0, 122, 255, 0.35)' },
  'google-green': { name: 'Apple Vert', hex: '#34C759', bgHex: 'rgba(52, 199, 89, 0.15)', borderHex: 'rgba(52, 199, 89, 0.35)' },
  'google-yellow': { name: 'Apple Orange', hex: '#FF9500', bgHex: 'rgba(255, 149, 0, 0.15)', borderHex: 'rgba(255, 149, 0, 0.35)' },
  'google-red': { name: 'Apple Rouge', hex: '#FF3B30', bgHex: 'rgba(255, 59, 48, 0.15)', borderHex: 'rgba(255, 59, 48, 0.35)' },
  'google-purple': { name: 'Apple Violet', hex: '#AF52DE', bgHex: 'rgba(175, 82, 222, 0.15)', borderHex: 'rgba(175, 82, 222, 0.35)' },
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(PREFS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to parse user preferences', e);
    }
    return DEFAULT_PREFERENCES;
  });

  // Track system preference for dark/light mode
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const effectiveTheme: 'light' | 'dark' | 'liquid-glass' =
    preferences.themeMode === 'liquid-glass'
      ? 'liquid-glass'
      : preferences.themeMode === 'system'
      ? (systemPrefersDark ? (preferences.surfaceTheme === 'liquid-glass' ? 'liquid-glass' : 'dark') : 'light')
      : preferences.themeMode;

  const isLiquidGlass = effectiveTheme === 'liquid-glass' || preferences.themeMode === 'liquid-glass';

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.warn('[SettingsContext] Failed to save preferences to localStorage:', e);
    }
  }, [preferences]);

  // Sync document root classes for global light/dark CSS
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (effectiveTheme === 'liquid-glass') {
        root.classList.add('dark', 'liquid-glass');
        root.classList.remove('light');
        document.body.style.backgroundColor = '#050711';
        document.body.style.color = '#f5f5f7';
      } else if (effectiveTheme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light', 'liquid-glass');
        document.body.style.backgroundColor = '#000000';
        document.body.style.color = '#f5f5f7';
      } else {
        root.classList.add('light');
        root.classList.remove('dark', 'liquid-glass');
        document.body.style.backgroundColor = '#f5f5f7';
        document.body.style.color = '#1d1d1f';
      }
    }
  }, [effectiveTheme]);

  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const setThemeMode = (mode: ThemeMode) => {
    updatePreference('themeMode', mode);
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  const accentColorHex = THEME_COLOR_MAP[preferences.themeColor]?.hex || '#007AFF';
  const accentBgHex = THEME_COLOR_MAP[preferences.themeColor]?.bgHex || 'rgba(0, 122, 255, 0.15)';

  const getRoundedClass = (element: 'card' | 'container' | 'pill' | 'button' | 'modal') => {
    if (element === 'pill') return 'rounded-full';

    switch (preferences.borderRadius) {
      case 'extra': // Apple Squircle / Ultra rounded
        if (element === 'card') return 'rounded-2xl';
        if (element === 'container') return 'rounded-3xl';
        if (element === 'modal') return 'rounded-3xl';
        if (element === 'button') return 'rounded-xl';
        return 'rounded-2xl';
      case 'standard': // Standard Apple
        if (element === 'card') return 'rounded-xl';
        if (element === 'container') return 'rounded-2xl';
        if (element === 'modal') return 'rounded-2xl';
        if (element === 'button') return 'rounded-lg';
        return 'rounded-xl';
      case 'minimal': // Subtle rounding
        if (element === 'card') return 'rounded-lg';
        if (element === 'container') return 'rounded-xl';
        if (element === 'modal') return 'rounded-xl';
        if (element === 'button') return 'rounded-md';
        return 'rounded-lg';
      default:
        return 'rounded-2xl';
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        preferences,
        updatePreference,
        resetPreferences,
        accentColorHex,
        accentBgHex,
        effectiveTheme,
        isLiquidGlass,
        setThemeMode,
        getRoundedClass,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
};
