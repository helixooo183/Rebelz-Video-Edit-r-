import React, { useEffect, useMemo, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleProp, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/theme/tokens';

/** Yükleniyor durumunda sonsuz spinner yerine iskelet. Azaltılmış harekette sabit kalır. */
export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(0.85)).current;
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (!mounted) return;
        reduceMotionRef.current = enabled;
        if (enabled) return;
        Animated.loop(
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.85, duration: 700, useNativeDriver: true }),
          ])
        ).start();
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
      opacity.stopAnimation();
    };
  }, [opacity]);

  const baseStyle = useMemo<ViewStyle>(
    () => ({
      backgroundColor: theme.colors.skeleton,
      borderRadius: radius.md,
    }),
    [theme.colors.skeleton]
  );

  return (
    <Animated.View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={[baseStyle, { opacity }, style]}
    />
  );
}
