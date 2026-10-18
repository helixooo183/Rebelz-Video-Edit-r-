import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useCallback } from 'react';

import { usePreferences } from '@/store/preferences';

type HapticKind = 'select' | 'impact' | 'success' | 'warning';

/**
 * Kısa dokunma geri bildirimi. Tercih kapalıysa veya web'de sessizce atlanır.
 */
export function useHaptics() {
  const { preferences } = usePreferences();

  return useCallback(
    async (kind: HapticKind = 'select') => {
      if (!preferences.haptics || Platform.OS === 'web') return;
      try {
        if (kind === 'select') {
          await Haptics.selectionAsync();
        } else if (kind === 'impact') {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (kind === 'success') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      } catch {
        // Titreşim desteklenmiyorsa kullanıcıya hata gösterilmez.
      }
    },
    [preferences.haptics]
  );
}
