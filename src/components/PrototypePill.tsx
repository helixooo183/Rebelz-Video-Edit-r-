import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/i18n';
import { radius, space } from '@/theme/tokens';
import { ThemedText } from './ThemedText';

/** Prototip olduğunu açıkça belirtir; kullanıcı gerçek dosya beklememeli. */
export function PrototypePill({ label }: { label?: string }) {
  const { theme } = useTheme();
  const { t } = useI18n();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        paddingHorizontal: space.xs,
        paddingVertical: 4,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: theme.colors.warningBorder,
        backgroundColor: theme.colors.warningSoft,
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: theme.colors.warning,
        }}
      />
      <ThemedText
        variant="caption"
        style={{ color: theme.colors.warning, fontSize: 11, lineHeight: 14 }}
      >
        {label ?? t.settings.prototypeBadge}
      </ThemedText>
    </View>
  );
}
