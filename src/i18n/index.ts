import { getLocales } from 'expo-localization';
import { useMemo } from 'react';

import { AppLanguage } from '@/types';
import { usePreferences } from '@/store/preferences';
import { en, Strings, tr } from './strings';

export const dictionaries: Record<AppLanguage, Strings> = { tr, en };

export function resolveLanguage(setting: 'system' | AppLanguage): AppLanguage {
  if (setting === 'tr' || setting === 'en') return setting;
  const deviceLanguage = getLocales()[0]?.languageCode;
  return deviceLanguage === 'tr' ? 'tr' : 'en';
}

export function localeOf(language: AppLanguage) {
  return language === 'tr' ? 'tr-TR' : 'en-US';
}

export function useI18n() {
  const { preferences } = usePreferences();
  const language = resolveLanguage(preferences.language);
  const strings = dictionaries[language];

  return useMemo(
    () => ({
      language,
      t: strings,
      locale: localeOf(language),
    }),
    [language, strings]
  );
}

export type { Strings };
