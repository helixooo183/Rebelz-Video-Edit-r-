import React from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/theme/tokens';
import { Icon, IconName } from './Icon';

type Variant = 'plain' | 'surface' | 'overlay' | 'accent';

type Props = {
  name: IconName;
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: number;
  disabled?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Dokunma hedefi en az 48×48; ikon düğmeleri her zaman görünür etiket taşır. */
export function IconButton({
  name,
  label,
  onPress,
  variant = 'plain',
  size = 48,
  disabled = false,
  selected = false,
  style,
  testID,
}: Props) {
  const { theme } = useTheme();
  const { colors } = theme;

  let background: string = 'transparent';
  let borderColor = 'transparent';
  let iconColor = colors.text;

  if (variant === 'surface') {
    background = colors.surface;
    borderColor = colors.border;
  } else if (variant === 'overlay') {
    background = colors.mediaControl;
    iconColor = colors.onMedia;
  } else if (variant === 'accent') {
    background = selected ? colors.accentFill : colors.accentSoft;
    iconColor = selected ? colors.onAccent : colors.accent;
  }

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected }}
      hitSlop={4}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: background,
          borderWidth: borderColor === 'transparent' ? 0 : 1,
          borderColor,
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Icon name={name} size={Math.round(size * 0.46)} color={iconColor} />
    </Pressable>
  );
}
