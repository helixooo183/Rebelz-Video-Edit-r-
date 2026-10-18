import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/StateViews';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/i18n';
import { layout, space } from '@/theme/tokens';

export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useI18n();

  const isKnown = doc === 'privacy' || doc === 'terms';
  const content = doc === 'terms' ? t.legal.terms : t.legal.privacy;

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/settings');
  };

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.xs,
          paddingHorizontal: layout.screenPadding,
          paddingTop: space.xxs,
          paddingBottom: space.xs,
        }}
      >
        <IconButton name="arrow-back" label={t.common.back} onPress={handleBack} variant="surface" />
        <ThemedText variant="body" weight="semibold" numberOfLines={1} style={{ flex: 1 }}>
          {isKnown ? content.title : t.meta.notFoundTitle}
        </ThemedText>
      </View>

      {!isKnown ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            icon="link-off"
            title={t.meta.notFoundTitle}
            body={t.meta.notFoundBody}
            actionLabel={t.common.back}
            onAction={handleBack}
          />
        </View>
      ) : (
        <ScrollView
          style={{ width: '100%', maxWidth: 640, alignSelf: 'center' }}
          contentContainerStyle={{
            paddingHorizontal: layout.screenPadding,
            paddingTop: space.md,
            paddingBottom: space.xxl,
            gap: space.lg,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: 4 }}>
            <ThemedText variant="display" accessibilityRole="header">
              {content.title}
            </ThemedText>
            <ThemedText variant="caption" tone="tertiary">
              {content.updated}
            </ThemedText>
          </View>

          <ThemedText variant="body" tone="secondary">
            {content.intro}
          </ThemedText>

          <View
            accessible
            style={{
              height: 1,
              backgroundColor: theme.colors.border,
            }}
          />

          {content.sections.map((section) => (
            <View key={section.heading} style={{ gap: space.xxs }}>
              <ThemedText variant="title" accessibilityRole="header">
                {section.heading}
              </ThemedText>
              <ThemedText variant="body" tone="secondary">
                {section.body}
              </ThemedText>
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}
