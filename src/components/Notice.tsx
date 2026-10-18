import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radius, space } from '@/theme/tokens';
import { Icon, IconName } from './Icon';
import { ThemedText } from './ThemedText';

/** Kısa onay / bilgi satırı. Ekran okuyucuya nazikçe duyurulur. */
export function Notice({
  text,
  kind = 'success',
}: {
  text: string;
  kind?: 'success' | 'info' | 'warning';
}) {
  const { theme } = useTheme();
  const map = {
    success: {
      bg: theme.colors.successSoft,
      border: theme.colors.successBorder,
      color: theme.colors.success,
      icon: 'check-circle' as IconName,
    },
    info: {
      bg: theme.colors.accentSoft,
      border: theme.colors.accentBorder,
      color: theme.colors.accent,
      icon: 'info-outline' as IconName,
    },
    warning: {
      bg: theme.colors.warningSoft,
      border: theme.colors.warningBorder,
      color: theme.colors.warning,
      icon: 'warning-amber' as IconName,
    },
  }[kind];

  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.xs,
        paddingHorizontal: space.sm,
        paddingVertical: 10,
        borderRadius: radius.md,
        backgroundColor: map.bg,
        borderWidth: 1,
        borderColor: map.border,
      }}
    >
      <Icon name={map.icon} size={18} color={map.color} />
      <ThemedText variant="caption" style={{ color: map.color, flex: 1 }}>
        {text}
      </ThemedText>
    </View>
  );
}
