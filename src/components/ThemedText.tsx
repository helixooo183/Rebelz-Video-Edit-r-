import React from 'react';
import { Text, TextProps } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { fontFamily, type, weights } from '@/theme/tokens';

type Variant = keyof typeof type;
type Tone = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'inverse' | 'danger' | 'onAccent';

type Props = TextProps & {
  variant?: Variant;
  tone?: Tone;
  weight?: keyof typeof weights;
  numeric?: boolean;
};

/** En fazla 4 punto ve 2 ağırlık; Dynamic Type korunur. */
export function ThemedText({
  variant = 'body',
  tone = 'primary',
  weight,
  numeric = false,
  style,
  ...rest
}: Props) {
  const { theme } = useTheme();
  const { colors } = theme;

  const toneColor: Record<Tone, string> = {
    primary: colors.text,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    accent: colors.accent,
    inverse: colors.textInverse,
    danger: colors.danger,
    onAccent: colors.onAccent,
  };

  return (
    <Text
      {...rest}
      allowFontScaling
      style={[
        type[variant],
        { color: toneColor[tone], fontFamily },
        weight ? { fontWeight: weights[weight] } : null,
        numeric ? { fontVariant: ['tabular-nums'] } : null,
        style,
      ]}
    />
  );
}
