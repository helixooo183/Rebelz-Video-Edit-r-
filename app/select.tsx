import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Linking, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { Icon, IconName } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { LoadingBlock, ErrorState } from '@/components/StateViews';
import { ThemedText } from '@/components/ThemedText';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { useProjects } from '@/store/projects';
import { durationLimits, layout, radius, space } from '@/theme/tokens';
import { Clip } from '@/types';
import { pickVideos } from '@/utils/picker';
import { projectDuration } from '@/utils/media';
import { formatClock } from '@/utils/format';

type SelectError = 'permission' | 'too-many' | 'too-long' | 'unsupported' | null;

export default function SelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useI18n();
  const haptics = useHaptics();
  const { preferences } = usePreferences();
  const { projects, getProject, createProject, updateProject } = useProjects();

  const params = useLocalSearchParams<{ projectId?: string }>();
  const projectId = params.projectId && projects.some((item) => item.id === params.projectId)
    ? params.projectId
    : undefined;
  const project = projectId ? getProject(projectId) : undefined;

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<SelectError>(null);
  const [permissionCanOpenSettings, setPermissionCanOpenSettings] = useState(false);

  const existingClips = project?.clips ?? [];
  const remaining = Math.max(0, durationLimits.maxClips - existingClips.length);
  const existingDuration = projectDuration(existingClips);

  useEffect(() => {
    setError(null);
  }, [projectId]);

  const title = project ? t.editor.addClips : t.select.title;
  const maxSelectable = Math.min(remaining, durationLimits.maxClips);

  const info: { icon: IconName; text: string }[] = useMemo(
    () => [
      { icon: 'video-library', text: t.select.limitClips },
      { icon: 'schedule', text: t.select.limitDuration },
      { icon: 'lock-outline', text: t.select.privacy },
    ],
    [t]
  );

  const handleChoose = async () => {
    if (processing) return;
    if (remaining <= 0) {
      setError('too-many');
      return;
    }
    setError(null);
    setProcessing(true);
    await haptics('select');

    const result = await pickVideos(maxSelectable);
    setProcessing(false);

    if (result.status === 'cancelled') return;
    if (result.status === 'permission-denied') {
      setError('permission');
      setPermissionCanOpenSettings(true);
      return;
    }
    if (result.status === 'error') {
      setError('unsupported');
      return;
    }
    if (result.status === 'empty') {
      setError('unsupported');
      return;
    }

    const combined: Clip[] = [...existingClips, ...result.clips];
    if (combined.length > durationLimits.maxClips) {
      setError('too-many');
      void haptics('warning');
      return;
    }
    if (projectDuration(combined) > durationLimits.maxTotalSeconds) {
      setError('too-long');
      void haptics('warning');
      return;
    }

    if (project) {
      updateProject(project.id, (current) => ({ ...current, clips: combined, status: 'draft' }));
      void haptics('success');
      if (router.canGoBack()) router.back();
      else router.replace(`/editor/${project.id}`);
      return;
    }

    const created = createProject(result.clips, preferences.defaultAspect);
    void haptics('success');
    router.replace(`/editor/${created.id}`);
  };

  const handleCancel = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/projects');
  };

  return (
    <Screen edges={['top', 'left', 'right']}>
      <View style={{ flex: 1, width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: layout.screenPadding,
            paddingTop: space.sm,
          }}
        >
          <IconButton
            name="close"
            label={t.common.close}
            onPress={handleCancel}
            variant="surface"
          />
          <ThemedText variant="caption" tone="secondary" numeric>
            {existingClips.length > 0
              ? t.select.selectionCount(existingClips.length, durationLimits.maxClips)
              : t.select.limitClips}
          </ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: layout.screenPadding,
            paddingTop: space.lg,
            paddingBottom: space.xl,
            gap: space.lg,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: space.xs }}>
            <ThemedText variant="display" accessibilityRole="header">
              {title}
            </ThemedText>
            <ThemedText variant="body" tone="secondary">
              {t.select.body}
            </ThemedText>
            {project ? (
              <ThemedText variant="caption" tone="tertiary">
                {t.select.fromEditorHint}
              </ThemedText>
            ) : null}
          </View>

          <View
            style={{
              borderRadius: radius.xl,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: 132,
                backgroundColor: theme.colors.surfaceSunken,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                gap: space.xs,
              }}
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
                }}
              >
                <Icon name="photo-library" size={26} color={theme.colors.accent} />
              </View>
              <ThemedText variant="caption" tone="tertiary">
                {formatClock(existingDuration)} / {formatClock(durationLimits.maxTotalSeconds)}
              </ThemedText>
            </View>

            {info.map((row, index) => (
              <View key={row.icon}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space.sm,
                    paddingHorizontal: space.md,
                    paddingVertical: 14,
                  }}
                >
                  <Icon name={row.icon} size={20} color={theme.colors.textSecondary} />
                  <ThemedText variant="body" tone="secondary" style={{ flex: 1 }}>
                    {row.text}
                  </ThemedText>
                </View>
                {index < info.length - 1 ? (
                  <View
                    style={{
                      height: 1,
                      marginLeft: space.md + 20 + space.sm,
                      backgroundColor: theme.colors.border,
                    }}
                  />
                ) : null}
              </View>
            ))}
          </View>

          {error === 'permission' ? (
            <ErrorState
              title={t.select.permissionTitle}
              body={t.select.permissionBody}
              retryLabel={permissionCanOpenSettings ? t.common.openSettings : t.common.retry}
              onRetry={() => {
                if (permissionCanOpenSettings) {
                  void Linking.openSettings().catch(() => undefined);
                } else {
                  void handleChoose();
                }
              }}
            />
          ) : error === 'too-many' ? (
            <ErrorState
              title={t.editor.limitReached}
              body={t.editor.limitBody(durationLimits.maxClips)}
              tone="warning"
            />
          ) : error === 'too-long' ? (
            <ErrorState
              title={t.select.limitDuration}
              body={t.select.tooLong}
              tone="warning"
              icon="schedule"
            />
          ) : error === 'unsupported' ? (
            <ErrorState
              title={t.select.errorTitle}
              body={t.select.errorBody}
              retryLabel={t.select.retry}
              onRetry={() => void handleChoose()}
            />
          ) : null}

          {processing ? <LoadingBlock label={t.select.loadingVideos} /> : null}
        </ScrollView>

        <View
          style={{
            paddingHorizontal: layout.screenPadding,
            paddingTop: space.sm,
            paddingBottom: Math.max(insets.bottom, space.sm),
            gap: space.xxs,
          }}
        >
          <Button
            label={t.select.choose}
            icon="add-photo-alternate"
            onPress={() => void handleChoose()}
            disabled={processing || remaining <= 0}
          />
          <Button
            label={t.common.cancel}
            onPress={handleCancel}
            variant="text"
            size="md"
          />
        </View>
      </View>
    </Screen>
  );
}
