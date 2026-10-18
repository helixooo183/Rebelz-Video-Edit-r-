import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';

type Props = {
  children: React.ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  background?: string;
};

/** Safe area'yı delmeyen ekran kökü. Alt kenar, alt çubuk olan ekranlarda ayrıca yönetilir. */
export function Screen({ children, edges = ['top', 'left', 'right'], style, background }: Props) {
  const { theme } = useTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[{ flex: 1, backgroundColor: background ?? theme.colors.bg }, style]}
    >
      {children}
    </SafeAreaView>
  );
}
