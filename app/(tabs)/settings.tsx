import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Icon } from '@/components/Icon';
import { PrototypePill } from '@/components/PrototypePill';
import { Screen } from '@/components/Screen';
import { SectionLabel } from '@/components/SectionLabel';
import { SegmentedControl } from '@/components/SegmentedControl';
import {
  NavigationRow,
  RowDivider,
  SettingsCard,
  SwitchRow,
  ValueBlock,
} from '@/components/SettingsRows';
import { ThemedText } from '@/components/ThemedText';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { useProjects } from '@/store/projects';
import { clearAllAppData } from '@/store/storage';
import { resetOnboarding } from '@/store/onboarding';
import { layout, space } from '@/theme/tokens';
import { Aspect, LanguageSetting, PresetId, ThemeMode } from '@/types';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useI18n();
  const haptics = useHaptics();
  const { preferences, updatePreferences, resetPreferences } = usePreferences();
  const { projects, clearProjects, storageError } = useProjects();
  const [clearDialogVisible, setClearDialogVisible] = useState(false);

  const version = Constants.expoConfig?.version ?? '1.0.0';

  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: 'system', label: t.settings.themeSystem },
    { value: 'light', label: t.settings.themeLight },
    { value: 'dark', label: t.settings.themeDark },
  ];
  const languageOptions: { value: LanguageSetting; label: string }[] = [
    { value: 'system', label: t.settings.languageSystem },
    { value: 'tr', label: t.settings.languageTr },
    { value: 'en', label: t.settings.languageEn },
  ];
  const qualityOptions: { value: PresetId; label: string; hint: string }[] = [
    { value: '720p', label: '720p', hint: t.exportScreen.quality720Note },
    { value: '1080p', label: '1080p', hint: t.exportScreen.quality1080Note },
    { value: '1080p60', label: '1080p 60', hint: t.exportScreen.quality108060Note },
  ];
  const ratioOptions: { value: Aspect; label: string }[] = [
    { value: '9:16', label: '9:16' },
    { value: '1:1', label: '1:1' },
    { value: '16:9', label: '16:9' },
  ];

  const handleClear = async () => {
    setClearDialogVisible(false);
    await haptics('warning');
    await clearAllAppData();
    clearProjects();
    resetPreferences();
    await resetOnboarding();
    router.replace('/');
  };

  return (
    <Screen>
      <ScrollView
        style={{ width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center' }}
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: space.sm,
          paddingBottom: space.xl,
          gap: space.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <ThemedText variant="display" accessibilityRole="header">
            {t.settings.title}
          </ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Icon name="lock-outline" size={14} color={theme.colors.textTertiary} />
            <ThemedText variant="caption" tone="secondary">
              {t.settings.localOnly}
            </ThemedText>
          </View>
        </View>

        {storageError ? (
          <View
            style={{
              padding: space.sm,
              borderRadius: 12,
              backgroundColor: theme.colors.dangerSoft,
              borderWidth: 1,
              borderColor: theme.colors.dangerBorder,
            }}
          >
            <ThemedText variant="caption" style={{ color: theme.colors.danger }}>
              {t.settings.storageError}
            </ThemedText>
          </View>
        ) : null}

        <View>
          <SectionLabel>{t.settings.sectionGeneral}</SectionLabel>
          <SettingsCard>
            <ValueBlock label={t.settings.appearance} hint={t.settings.appearanceHint}>
              <SegmentedControl
                options={themeOptions}
                value={preferences.themeMode}
                onChange={(next) => {
                  void haptics('select');
                  updatePreferences({ themeMode: next });
                }}
                accessibilityLabel={t.settings.appearance}
              />
            </ValueBlock>
            <RowDivider />
            <ValueBlock label={t.settings.language}>
              <SegmentedControl
                options={languageOptions}
                value={preferences.language}
                onChange={(next) => {
                  void haptics('select');
                  updatePreferences({ language: next });
                }}
                accessibilityLabel={t.settings.language}
              />
            </ValueBlock>
            <RowDivider />
            <SwitchRow
              label={t.settings.haptics}
              hint={t.settings.hapticsHint}
              value={preferences.haptics}
              onValueChange={(next) => {
                updatePreferences({ haptics: next });
                if (next) void haptics('impact');
              }}
              last
            />
          </SettingsCard>
        </View>

        <View>
          <SectionLabel>{t.settings.sectionOutput}</SectionLabel>
          <SettingsCard>
            <ValueBlock label={t.settings.defaultQuality}>
              <SegmentedControl
                options={qualityOptions}
                value={preferences.defaultPreset}
                onChange={(next) => {
                  void haptics('select');
                  updatePreferences({ defaultPreset: next });
                }}
                accessibilityLabel={t.settings.defaultQuality}
              />
            </ValueBlock>
            <RowDivider />
            <ValueBlock label={t.settings.defaultRatio}>
              <SegmentedControl
                options={ratioOptions}
                value={preferences.defaultAspect}
                onChange={(next) => {
                  void haptics('select');
                  updatePreferences({ defaultAspect: next });
                }}
                accessibilityLabel={t.settings.defaultRatio}
              />
            </ValueBlock>
          </SettingsCard>
        </View>

        <View>
          <SectionLabel>{t.settings.legal}</SectionLabel>
          <SettingsCard>
            <NavigationRow
              label={t.settings.privacy}
              icon="security"
              onPress={() => router.push('/legal/privacy')}
            />
            <NavigationRow
              label={t.settings.terms}
              icon="article"
              onPress={() => router.push('/legal/terms')}
              last
            />
          </SettingsCard>
        </View>

        <View>
          <SectionLabel>{t.settings.data}</SectionLabel>
          <SettingsCard>
            <NavigationRow
              label={t.settings.clearData}
              icon="delete-outline"
              destructive
              onPress={() => setClearDialogVisible(true)}
              last
            />
          </SettingsCard>
          <ThemedText variant="caption" tone="tertiary" style={{ marginTop: 6 }}>
            {t.settings.clearDataHint(projects.length)}
          </ThemedText>
        </View>

        <View>
          <SectionLabel>{t.settings.sectionAbout}</SectionLabel>
          <SettingsCard>
            <View style={{ padding: space.md, gap: space.sm }}>
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
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: theme.colors.accentFill,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ThemedText
                      variant="title"
                      weight="semibold"
                      style={{ color: theme.colors.onAccent }}
                    >
                      R
                    </ThemedText>
                  </View>
                  <View>
                    <ThemedText variant="body" weight="semibold">
                      {t.meta.appName}
                    </ThemedText>
                    <ThemedText variant="caption" tone="tertiary" numeric>
                      {t.settings.version(version)}
                    </ThemedText>
                  </View>
                </View>
                <PrototypePill />
              </View>
              <ThemedText variant="caption" tone="secondary">
                {t.settings.aboutBody}
              </ThemedText>
            </View>
          </SettingsCard>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={clearDialogVisible}
        title={t.settings.clearTitle}
        body={t.settings.clearBody}
        confirmLabel={t.settings.clearConfirm}
        cancelLabel={t.common.cancel}
        onCancel={() => setClearDialogVisible(false)}
        onConfirm={() => void handleClear()}
      />
    </Screen>
  );
}
