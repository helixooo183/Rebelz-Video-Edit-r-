import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/i18n';
import { radius, space } from '@/theme/tokens';
import { Button } from './Button';
import { Icon, IconName } from './Icon';
import { ThemedText } from './ThemedText';

const TAB_ICONS: Record<string, IconName> = {
  index: 'movie-filter',
  projects: 'movie-filter',
  settings: 'settings',
};

/**
 * Alt gezinme: iki sekme ve ekranın alt üçte birindeki birincil "Yeni video" eylemi.
 * Seçili sekme renk, ağırlık ve üst göstergeyle birlikte anlaşılır.
 */
export function BottomDock({ state, navigateToTab, insets }: BottomTabBarProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const haptics = useHaptics();

  const labels: Record<string, string> = {
    index: t.tabs.projects,
    projects: t.tabs.projects,
    settings: t.tabs.settings,
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.xxs,
        paddingLeft: space.xs,
        paddingRight: space.sm,
        paddingTop: space.xs,
        paddingBottom: Math.max(insets.bottom, space.xs),
        backgroundColor: theme.colors.tabBar,
        borderTopWidth: 1,
        borderTopColor: theme.colors.tabBarBorder,
      }}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const label = labels[route.name] ?? route.name;
        const icon = TAB_ICONS[route.name] ?? 'circle';
        return (
          <Pressable
            key={route.key}
            onPress={() => {
              if (!focused) {
                void haptics('select');
                navigateToTab(route.key);
              }
            }}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: focused }}
            accessibilityHint={t.a11y.tab}
            hitSlop={4}
            style={({ pressed }) => ({
              minWidth: 64,
              minHeight: 52,
              paddingHorizontal: space.xs,
              paddingVertical: 6,
              borderRadius: radius.md,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <View
              style={{
                width: 24,
                height: 3,
                borderRadius: 2,
                marginBottom: 2,
                backgroundColor: focused ? theme.colors.accentFill : 'transparent',
              }}
            />
            <Icon
              name={icon}
              size={22}
              color={focused ? theme.colors.tabActive : theme.colors.tabInactive}
            />
            <ThemedText
              variant="caption"
              weight={focused ? 'semibold' : 'regular'}
              style={{
                fontSize: 11,
                lineHeight: 14,
                color: focused ? theme.colors.tabActive : theme.colors.tabInactive,
              }}
            >
              {label}
            </ThemedText>
          </Pressable>
        );
      })}

      <View style={{ flex: 1 }} />

      <Button
        label={t.projects.newVideo}
        icon="add"
        onPress={() => {
          void haptics('impact');
          router.push('/select');
        }}
        accessibilityLabel={t.a11y.newVideo}
        fullWidth={false}
        style={{
          minHeight: 48,
          height: 48,
          paddingHorizontal: space.sm,
          borderRadius: radius.pill,
        }}
      />
    </View>
  );
}
