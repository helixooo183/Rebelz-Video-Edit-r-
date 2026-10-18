import React from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radius, space } from '@/theme/tokens';
import { ThemedText } from './ThemedText';
import { Icon, IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'text' | 'destructive';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: 'md' | 'lg';
  icon?: IconName;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
};

/**
 * Dokunma hedefi en az 48 pt. Yıkıcı eylemler dolgu değil metin düğmesi olarak sunulur.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  disabled = false,
  fullWidth = true,
  style,
  accessibilityLabel,
  testID,
}: Props) {
  const { theme } = useTheme();
  const { colors } = theme;
  const height = size === 'lg' ? 52 : 48;

  const background =
    variant === 'primary'
      ? colors.accentFill
      : variant === 'secondary'
        ? colors.surface
        : 'transparent';
  const borderColor = variant === 'secondary' ? colors.border : 'transparent';
  const textColor =
    variant === 'primary'
      ? colors.onAccent
      : variant === 'destructive'
        ? colors.danger
        : variant === 'text'
          ? colors.accent
          : colors.text;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      hitSlop={4}
      style={({ pressed }) => [
        {
          minHeight: height,
          paddingHorizontal: space.lg,
          borderRadius: radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: space.xs,
          backgroundColor: background,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor,
          opacity: disabled ? 0.45 : pressed ? 0.88 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          transform: [{ scale: pressed && !disabled ? 0.995 : 1 }],
        },
        variant === 'secondary' ? theme.shadow.card : null,
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={20} color={textColor} /> : null}
      <ThemedText variant="body" weight="semibold" style={{ color: textColor }} numberOfLines={1}>
        {label}
      </ThemedText>
    </Pressable>
  );
}
