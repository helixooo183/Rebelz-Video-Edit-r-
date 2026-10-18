import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { space } from '@/theme/tokens';
import { ThemedText } from './ThemedText';

export function SectionLabel({
  children,
  style,
  trailing,
}: {
  children: string;
  style?: StyleProp<ViewStyle>;
  trailing?: React.ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: space.xs,
          marginBottom: space.sm,
        },
        style,
      ]}
    >
      <ThemedText
        variant="caption"
        weight="semibold"
        tone="tertiary"
        style={{ letterSpacing: 0.9, textTransform: 'uppercase' }}
      >
        {children}
      </ThemedText>
      {trailing}
    </View>
  );
}

export function Divider({ inset = 0 }: { inset?: number }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        height: theme.scheme === 'dark' ? 1 : 1,
        backgroundColor: theme.colors.border,
        marginLeft: inset,
      }}
    />
  );
}
