import { useColorScheme } from 'react-native';

import { usePreferences } from '@/store/preferences';
import { ColorScheme, Theme, themes } from '@/theme/tokens';

export function useTheme(): { theme: Theme; scheme: ColorScheme } {
  const systemScheme = useColorScheme();
  const { preferences } = usePreferences();
  const scheme: ColorScheme =
    preferences.themeMode === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : preferences.themeMode;

  return { theme: themes[scheme], scheme };
}
