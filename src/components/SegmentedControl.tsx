import React from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radius, space } from '@/theme/tokens';
import { ThemedText } from './ThemedText';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  hint?: string;
};

type Props<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (next: T) => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

/**
 * Dokunmalı seçim; seçili durum renk + kenarlık + ağırlıkla birlikte anlaşılır.
 * Her seçenek 48 pt hedef ve radyo rolü taşır.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  style,
  disabled = false,
}: Props<T>) {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          flexDirection: 'row',
          gap: space.xxs,
          padding: space.xxs,
          backgroundColor: colors.surfaceSunken,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled }}
            accessibilityLabel={option.hint ? `${option.label}, ${option.hint}` : option.label}
            hitSlop={2}
            style={({ pressed }) => ({
              flex: 1,
              minHeight: 44,
              paddingHorizontal: space.xs,
              paddingVertical: space.xs,
              borderRadius: radius.md,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              backgroundColor: selected ? colors.surface : 'transparent',
              borderWidth: 1,
              borderColor: selected ? colors.accentBorder : 'transparent',
              opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
            })}
          >
            <ThemedText
              variant="caption"
              weight={selected ? 'semibold' : 'regular'}
              tone={selected ? 'primary' : 'secondary'}
              numberOfLines={2}
              style={{ textAlign: 'center' }}
            >
              {option.label}
            </ThemedText>
            {option.hint ? (
              <ThemedText
                variant="caption"
                tone="tertiary"
                numberOfLines={1}
                style={{ fontSize: 11, lineHeight: 14 }}
              >
                {option.hint}
              </ThemedText>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
