import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Icon, IconName } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { hasOnboarded, markOnboarded } from '@/store/onboarding';
import { layout, mediaGradient, radius, space } from '@/theme/tokens';

const FEATURES: { icon: IconName; titleKey: 'featureTrimTitle' | 'featureMergeTitle' | 'featureExportTitle'; bodyKey: 'featureTrimBody' | 'featureMergeBody' | 'featureExportBody' }[] = [
  { icon: 'content-cut', titleKey: 'featureTrimTitle', bodyKey: 'featureTrimBody' },
  { icon: 'playlist-add', titleKey: 'featureMergeTitle', bodyKey: 'featureMergeBody' },
  { icon: 'file-download', titleKey: 'featureExportTitle', bodyKey: 'featureExportBody' },
];

function PreviewMock() {
  const { theme } = useTheme();
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Rebel Cut"
      style={{
        borderRadius: radius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <LinearGradient
        colors={[...mediaGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ height: 168, padding: space.md, justifyContent: 'space-between' }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {[0, 1, 2].map((dot) => (
            <View
              key={dot}
              style={{
                width: dot === 0 ? 18 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  dot === 0 ? theme.colors.accentFill : theme.colors.mediaBorder,
              }}
            />
          ))}
        </View>

        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: theme.colors.mediaTint,
              borderWidth: 1,
              borderColor: theme.colors.mediaBorder,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="play-arrow" size={32} color={theme.colors.onMedia} />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {[5, 8, 4, 7, 3].map((weight, index) => (
              <View
                key={`${weight}-${index}`}
                style={{
                  flex: weight,
                  height: 26,
                  borderRadius: 5,
                  backgroundColor:
                    index === 1 ? theme.colors.accentWash : theme.colors.mediaTint,
                  borderWidth: 1,
                  borderColor:
                    index === 1 ? theme.colors.accentBorder : theme.colors.mediaBorder,
                }}
              />
            ))}
          </View>
          <View style={{ height: 3, borderRadius: 2, backgroundColor: theme.colors.mediaTrack }}>
            <View
              style={{
                width: '38%',
                height: 3,
                borderRadius: 2,
                backgroundColor: theme.colors.accentFill,
              }}
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t, language } = useI18n();
  const { updatePreferences } = usePreferences();
  const haptics = useHaptics();
  const [checking, setChecking] = useState(true);
  const [alreadyOnboarded, setAlreadyOnboarded] = useState(false);

  useEffect(() => {
    let active = true;
    hasOnboarded()
      .then((value) => {
        if (active) setAlreadyOnboarded(value);
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const finishOnboarding = useCallback(async () => {
    try {
      await markOnboarded();
    } catch {
      // Karşılama durumu yazılamazsa akış devam eder; kullanıcı yine de uygulamayı kullanabilir.
    }
  }, []);

  const handleChoose = async () => {
    await haptics('impact');
    await finishOnboarding();
    // Sekmeler altta kalır; seçim ekranı onların üzerinde açılır.
    router.replace('/(tabs)/projects?new=1');
  };

  const handleProjects = async () => {
    await haptics('select');
    await finishOnboarding();
    router.replace('/(tabs)/projects');
  };

  const toggleLanguage = () => {
    void haptics('select');
    updatePreferences({ language: language === 'tr' ? 'en' : 'tr' });
  };

  if (checking) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.bg }} />;
  }

  if (alreadyOnboarded) {
    return <Redirect href="/(tabs)/projects" />;
  }

  return (
    <Screen>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: layout.screenPadding,
            paddingTop: space.sm,
            paddingBottom: space.md,
            width: '100%',
            maxWidth: layout.contentMaxWidth,
            alignSelf: 'center',
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: space.sm,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: theme.colors.accentFill,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ThemedText
                  variant="body"
                  weight="semibold"
                  style={{ color: theme.colors.onAccent }}
                >
                  R
                </ThemedText>
              </View>
              <ThemedText variant="body" weight="semibold">
                {t.meta.shortName}
              </ThemedText>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
              <Pressable
                onPress={toggleLanguage}
                accessibilityRole="button"
                accessibilityLabel={t.a11y.openLanguage}
                accessibilityHint={t.welcome.languageLabel}
                hitSlop={4}
                style={({ pressed }) => ({
                  minHeight: 44,
                  minWidth: 64,
                  paddingHorizontal: space.sm,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: pressed ? theme.colors.surfaceSunken : theme.colors.surface,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                })}
              >
                <Icon name="language" size={17} color={theme.colors.textSecondary} />
                <ThemedText variant="caption" weight="semibold">
                  {language.toUpperCase()}
                </ThemedText>
              </Pressable>
            </View>
          </View>

          <View style={{ marginTop: space.lg, gap: space.sm }}>
            <ThemedText variant="caption" weight="semibold" tone="accent" style={{ letterSpacing: 0.8 }}>
              {t.welcome.eyebrow.toUpperCase()}
            </ThemedText>
            <ThemedText variant="display" accessibilityRole="header">
              {t.welcome.title}
            </ThemedText>
            <ThemedText variant="body" tone="secondary" style={{ maxWidth: 460 }}>
              {t.welcome.body}
            </ThemedText>
          </View>

          <View style={{ marginTop: space.lg }}>
            <PreviewMock />
          </View>

          <View
            accessibilityLabel={t.welcome.featureListLabel}
            style={{ marginTop: space.lg, gap: space.md }}
          >
            {FEATURES.map((feature) => (
              <View
                key={feature.titleKey}
                style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: radius.md,
                    backgroundColor: theme.colors.accentSoft,
                    borderWidth: 1,
                    borderColor: theme.colors.accentBorder,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name={feature.icon} size={20} color={theme.colors.accent} />
                </View>
                <View style={{ flex: 1, gap: 2, paddingTop: 1 }}>
                  <ThemedText variant="body" weight="semibold">
                    {t.welcome[feature.titleKey]}
                  </ThemedText>
                  <ThemedText variant="caption" tone="secondary">
                    {t.welcome[feature.bodyKey]}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginTop: space.lg,
            }}
          >
            <Icon name="lock-outline" size={15} color={theme.colors.textTertiary} />
            <ThemedText variant="caption" tone="tertiary">
              {t.welcome.privacy}
            </ThemedText>
          </View>
        </ScrollView>

        <View
          style={{
            paddingHorizontal: layout.screenPadding,
            paddingTop: space.sm,
            paddingBottom: Math.max(insets.bottom, space.sm),
            gap: space.xxs,
            width: '100%',
            maxWidth: layout.contentMaxWidth,
            alignSelf: 'center',
            backgroundColor: theme.colors.bg,
          }}
        >
          <Button label={t.welcome.primary} icon="add-photo-alternate" onPress={handleChoose} />
          <Button
            label={t.welcome.secondary}
            onPress={handleProjects}
            variant="text"
            size="md"
          />
        </View>
      </View>
    </Screen>
  );
}
