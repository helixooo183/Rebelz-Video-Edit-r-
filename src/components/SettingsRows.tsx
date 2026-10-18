import React from 'react';
import { Pressable, StyleProp, Switch, View, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radius, space } from '@/theme/tokens';
import { Icon, IconName } from './Icon';
import { ThemedText } from './ThemedText';

export function SettingsCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          overflow: 'hidden',
        },
        theme.shadow.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function RowDivider() {
  const { theme } = useTheme();
  return (
    <View
      style={{ height: 1, backgroundColor: theme.colors.border, marginLeft: space.md }}
      importantForAccessibility="no"
    />
  );
}

export function NavigationRow({
  label,
  value,
  icon,
  onPress,
  destructive = false,
  accessibilityHint,
  last = false,
}: {
  label: string;
  value?: string;
  icon?: IconName;
  onPress: () => void;
  destructive?: boolean;
  accessibilityHint?: string;
  last?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={value ? `${label}: ${value}` : label}
        accessibilityHint={accessibilityHint}
        style={({ pressed }) => ({
          minHeight: 56,
          paddingHorizontal: space.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.sm,
          backgroundColor: pressed ? theme.colors.surfaceSunken : 'transparent',
        })}
      >
        {icon ? (
          <Icon
            name={icon}
            size={21}
            color={destructive ? theme.colors.danger : theme.colors.textSecondary}
          />
        ) : null}
        <ThemedText
          variant="body"
          style={{
            flex: 1,
            color: destructive ? theme.colors.danger : theme.colors.text,
          }}
        >
          {label}
        </ThemedText>
        {value ? (
          <ThemedText variant="body" tone="secondary" numberOfLines={1} style={{ maxWidth: '45%' }}>
            {value}
          </ThemedText>
        ) : null}
        <Icon name="chevron-right" size={22} color={theme.colors.textTertiary} />
      </Pressable>
      {last ? null : <RowDivider />}
    </>
  );
}

export function SwitchRow({
  label,
  hint,
  value,
  onValueChange,
  last = false,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  last?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <>
      <View
        style={{
          minHeight: 56,
          paddingHorizontal: space.md,
          paddingVertical: space.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.md,
        }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <ThemedText variant="body">{label}</ThemedText>
          {hint ? (
            <ThemedText variant="caption" tone="tertiary">
              {hint}
            </ThemedText>
          ) : null}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          accessibilityLabel={label}
          accessibilityRole="switch"
          accessibilityState={{ checked: value }}
          trackColor={{ false: theme.colors.borderStrong, true: theme.colors.accentBorder }}
          thumbColor={value ? theme.colors.accentFill : theme.colors.surfaceRaised}
          ios_backgroundColor={theme.colors.borderStrong}
        />
      </View>
      {last ? null : <RowDivider />}
    </>
  );
}

export function ValueBlock({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <View style={{ padding: space.md, gap: space.xs }}>
      <ThemedText variant="body">{label}</ThemedText>
      {children}
      {hint ? (
        <ThemedText variant="caption" tone="tertiary">
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}
