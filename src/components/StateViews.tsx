import React from 'react';
import { ActivityIndicator, StyleProp, View, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radius, space } from '@/theme/tokens';
import { Button } from './Button';
import { Icon, IconName } from './Icon';
import { ThemedText } from './ThemedText';

type EmptyStateProps = {
  icon: IconName;
  title: string;
  body: string;
  caption?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({
  icon,
  title,
  body,
  caption,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  style,
}: EmptyStateProps) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: space.xxl,
          paddingHorizontal: space.lg,
          gap: space.sm,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: radius.pill,
          backgroundColor: theme.colors.accentSoft,
          borderWidth: 1,
          borderColor: theme.colors.accentBorder,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: space.xxs,
        }}
      >
        <Icon name={icon} size={26} color={theme.colors.accent} />
      </View>
      <ThemedText variant="title" style={{ textAlign: 'center' }} accessibilityRole="header">
        {title}
      </ThemedText>
      <ThemedText
        variant="body"
        tone="secondary"
        style={{ textAlign: 'center', maxWidth: 320 }}
      >
        {body}
      </ThemedText>
      {caption ? (
        <ThemedText variant="caption" tone="tertiary" style={{ textAlign: 'center' }}>
          {caption}
        </ThemedText>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          icon="add-photo-alternate"
          style={{ marginTop: space.sm, alignSelf: 'center', minWidth: 220 }}
        />
      ) : null}
      {secondaryLabel && onSecondary ? (
        <Button label={secondaryLabel} onPress={onSecondary} variant="text" size="md" fullWidth={false} />
      ) : null}
    </View>
  );
}

export function ErrorState({
  title,
  body,
  retryLabel,
  onRetry,
  tone = 'danger',
  icon = 'error-outline',
  style,
}: {
  title: string;
  body: string;
  retryLabel?: string;
  onRetry?: () => void;
  tone?: 'danger' | 'warning';
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useTheme();
  const color = tone === 'danger' ? theme.colors.danger : theme.colors.warning;
  const soft = tone === 'danger' ? theme.colors.dangerSoft : theme.colors.warningSoft;
  const border = tone === 'danger' ? theme.colors.dangerBorder : theme.colors.warningBorder;

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        {
          backgroundColor: soft,
          borderColor: border,
          borderWidth: 1,
          borderRadius: radius.lg,
          padding: space.md,
          flexDirection: 'row',
          gap: space.sm,
          alignItems: 'flex-start',
        },
        style,
      ]}
    >
      <Icon name={icon} size={20} color={color} style={{ marginTop: 1 }} />
      <View style={{ flex: 1, gap: space.xxs }}>
        <ThemedText variant="body" weight="semibold" style={{ color }}>
          {title}
        </ThemedText>
        <ThemedText variant="caption" tone="secondary">
          {body}
        </ThemedText>
        {retryLabel && onRetry ? (
          <Button
            label={retryLabel}
            onPress={onRetry}
            variant="text"
            size="md"
            fullWidth={false}
            style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }}
          />
        ) : null}
      </View>
    </View>
  );
}

export function LoadingBlock({ label }: { label: string }) {
  const { theme } = useTheme();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      style={{
        paddingVertical: space.xxl,
        alignItems: 'center',
        gap: space.sm,
      }}
    >
      <ActivityIndicator color={theme.colors.accent} />
      <ThemedText variant="caption" tone="tertiary">
        {label}
      </ThemedText>
    </View>
  );
}
