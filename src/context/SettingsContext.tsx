import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeColor = 'google-blue' | 'google-green' | 'google-red' | 'google-yellow' | 'google-purple';
export type SurfaceTheme = 'google-dark' | 'eclipse-dark' | 'material-light';
export type BorderRadiusStyle = 'extra' | 'standard' | 'minimal';
export type DisplayDensity = 'comfortable' | 'compact';
export type DefaultSort = 'manual' | 'priority' | 'date-desc' | 'date-asc';

export interface UserPreferences {
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
  surfaceTheme: 'google-dark',
  themeColor: 'google-blue',
  borderRadius: 'extra', // Google Material You extra rounded
  density: 'comfortable',
  autoMoveDoneTasks: true,
  confirmDelete: true,
  showImageThumbnails: true,
  showSubtaskProgress: true,
  defaultSort: 'manual',
  autoSaveLocalInterval: true,
  compactSidebar: false,
};

const PREFS_STORAGE_KEY = 'taskflow_user_preferences_v2';

interface SettingsContextType {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  resetPreferences: () => void;
  accentColorHex: string;
  accentBgHex: string;
  getRoundedClass: (element: 'card' | 'container' | 'pill' | 'button' | 'modal') => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const THEME_COLOR_MAP: Record<ThemeColor, { name: string; hex: string; bgHex: string; borderHex: string }> = {
  'google-blue': { name: 'Google Bleu', hex: '#4285F4', bgHex: 'rgba(66, 133, 244, 0.15)', borderHex: 'rgba(66, 133, 244, 0.35)' },
  'google-green': { name: 'Google Vert', hex: '#34A853', bgHex: 'rgba(52, 168, 83, 0.15)', borderHex: 'rgba(52, 168, 83, 0.35)' },
  'google-yellow': { name: 'Google Ambre', hex: '#FBBC05', bgHex: 'rgba(251, 188, 5, 0.15)', borderHex: 'rgba(251, 188, 5, 0.35)' },
  'google-red': { name: 'Google Corail', hex: '#EA4335', bgHex: 'rgba(234, 67, 53, 0.15)', borderHex: 'rgba(234, 67, 53, 0.35)' },
  'google-purple': { name: 'Google Indigo', hex: '#A142F4', bgHex: 'rgba(161, 66, 244, 0.15)', borderHex: 'rgba(161, 66, 244, 0.35)' },
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

  useEffect(() => {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  const accentColorHex = THEME_COLOR_MAP[preferences.themeColor]?.hex || '#4285F4';
  const accentBgHex = THEME_COLOR_MAP[preferences.themeColor]?.bgHex || 'rgba(66, 133, 244, 0.15)';

  const getRoundedClass = (element: 'card' | 'container' | 'pill' | 'button' | 'modal') => {
    if (element === 'pill') return 'rounded-full';

    switch (preferences.borderRadius) {
      case 'extra': // Google Material You (Ultra rounded)
        if (element === 'card') return 'rounded-2xl';
        if (element === 'container') return 'rounded-3xl';
        if (element === 'modal') return 'rounded-3xl';
        if (element === 'button') return 'rounded-xl';
        return 'rounded-2xl';
      case 'standard': // Standard Google Workspace
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
