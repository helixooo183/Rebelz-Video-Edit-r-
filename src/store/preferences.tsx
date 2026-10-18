import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { DEFAULT_PREFERENCES, Preferences } from '@/types';
import { readJSON, STORAGE_KEYS, writeJSON } from './storage';

type PreferencesContextValue = {
  preferences: Preferences;
  hydrated: boolean;
  updatePreferences: (patch: Partial<Preferences>) => void;
  resetPreferences: () => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function sanitize(value: unknown): Preferences {
  if (!value || typeof value !== 'object') return DEFAULT_PREFERENCES;
  const raw = value as Partial<Preferences>;
  return {
    themeMode:
      raw.themeMode === 'light' || raw.themeMode === 'dark' || raw.themeMode === 'system'
        ? raw.themeMode
        : DEFAULT_PREFERENCES.themeMode,
    language:
      raw.language === 'tr' || raw.language === 'en' || raw.language === 'system'
        ? raw.language
        : DEFAULT_PREFERENCES.language,
    haptics: typeof raw.haptics === 'boolean' ? raw.haptics : DEFAULT_PREFERENCES.haptics,
    defaultPreset:
      raw.defaultPreset === '720p' ||
      raw.defaultPreset === '1080p' ||
      raw.defaultPreset === '1080p60'
        ? raw.defaultPreset
        : DEFAULT_PREFERENCES.defaultPreset,
    defaultAspect:
      raw.defaultAspect === '9:16' || raw.defaultAspect === '1:1' || raw.defaultAspect === '16:9'
        ? raw.defaultAspect
        : DEFAULT_PREFERENCES.defaultAspect,
  };
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await readJSON<Preferences>(STORAGE_KEYS.preferences);
        if (!cancelled && stored) setPreferences(sanitize(stored));
      } catch {
        // Depolama okunamazsa varsayılanlarla devam edilir; kullanıcıya Ayarlar'da uyarı gösterilir.
      } finally {
        if (!cancelled) {
          hydratedRef.current = true;
          setHydrated(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    void writeJSON(STORAGE_KEYS.preferences, preferences);
  }, [preferences]);

  const updatePreferences = useCallback((patch: Partial<Preferences>) => {
    setPreferences((current) => ({ ...current, ...patch }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  const value = useMemo(
    () => ({ preferences, hydrated, updatePreferences, resetPreferences }),
    [preferences, hydrated, updatePreferences, resetPreferences]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences, PreferencesProvider içinde kullanılmalıdır.');
  return ctx;
}
