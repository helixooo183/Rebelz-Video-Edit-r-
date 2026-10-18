import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Icon, IconName } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { PrototypePill } from '@/components/PrototypePill';
import { Screen } from '@/components/Screen';
import { SectionLabel } from '@/components/SectionLabel';
import { SegmentedControl } from '@/components/SegmentedControl';
import { EmptyState } from '@/components/StateViews';
import { ThemedText } from '@/components/ThemedText';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { useProjects } from '@/store/projects';
import { layout, radius, space } from '@/theme/tokens';
import { Aspect, PresetId } from '@/types';
import { formatClock, formatBytes } from '@/utils/format';
import { estimateExport, estimateExportSeconds, projectDuration, clipDuration } from '@/utils/media';
import { goToProjects } from '@/utils/navigation';

type Phase = 'settings' | 'exporting';

export default function ExportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t, language } = useI18n();
  const haptics = useHaptics();
  const { preferences } = usePreferences();
  const { getProject, updateProject } = useProjects();

  const project = getProject(id);
  const clips = project?.clips ?? [];
  const totalDuration = projectDuration(clips);

  const [preset, setPreset] = useState<PresetId>(
    project?.lastExport?.preset ?? preferences.defaultPreset
  );
  const [aspect, setAspect] = useState<Aspect>(project?.aspect ?? preferences.defaultAspect);
  const [phase, setPhase] = useState<Phase>('settings');
  const [progress, setProgress] = useState(0);
  const [cancelVisible, setCancelVisible] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(0);
  const durationRef = useRef(1);
  const finishedRef = useRef(false);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => stopTimer, [stopTimer]);

  useEffect(() => {
    if (Platform.OS !== 'android' || phase !== 'exporting') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setCancelVisible(true);
      return true;
    });
    return () => subscription.remove();
  }, [phase]);

  const estimate = useMemo(() => estimateExport(clips, preset), [clips, preset]);
  const estimateSeconds = useMemo(
    () => estimateExportSeconds(clips, preset),
    [clips, preset]
  );

  const stageLabel = useMemo(() => {
    if (progress < 0.12) return t.exportScreen.preparing;
    if (progress < 0.78) return t.exportScreen.rendering;
    if (progress < 0.9) return t.exportScreen.audio;
    if (progress < 0.995) return t.exportScreen.writing;
    return t.exportScreen.finishing;
  }, [progress, t]);

  const remainingSeconds = Math.max(0, Math.ceil((1 - progress) * estimateSeconds));

  const handleBack = useCallback(() => {
    if (phase === 'exporting') {
      setCancelVisible(true);
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/projects');
  }, [phase, router]);

  const startExport = useCallback(() => {
    if (!project || clips.length === 0) return;
    stopTimer();
    finishedRef.current = false;
    startRef.current = Date.now();
    durationRef.current = Math.max(4, estimateSeconds) * 1000;
    setProgress(0);
    setPhase('exporting');
    void haptics('impact');

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const next = Math.min(1, elapsed / durationRef.current);
      setProgress(next);
      if (next >= 1 && !finishedRef.current) {
        finishedRef.current = true;
        stopTimer();
        updateProject(project.id, (current) => ({
          ...current,
          status: 'exported',
          aspect,
          lastExport: {
            preset,
            aspect,
            sizeBytes: estimateExport(current.clips, preset).bytes,
            at: Date.now(),
          },
        }));
        void haptics('success');
        router.replace(`/success/${project.id}`);
      }
    }, 100);
  }, [aspect, clips.length, estimateSeconds, haptics, preset, project, router, stopTimer, updateProject]);

  const confirmCancel = useCallback(() => {
    stopTimer();
    setCancelVisible(false);
    setPhase('settings');
    setProgress(0);
    void haptics('warning');
  }, [haptics, stopTimer]);

  if (!project) {
    return (
      <Screen>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: layout.screenPadding,
            paddingTop: space.sm,
          }}
        >
          <IconButton name="arrow-back" label={t.common.back} onPress={handleBack} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            icon="error-outline"
            title={t.exportScreen.noProject}
            body={t.exportScreen.noProjectBody}
            actionLabel={t.success.backToProjects}
            onAction={() => goToProjects(router)}
          />
        </View>
      </Screen>
    );
  }

  const hasUnknownDuration = clips.some((clip) => clipDuration(clip) <= 0);

  if (totalDuration < 0.5 || hasUnknownDuration) {
    return (
      <Screen>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: layout.screenPadding,
            paddingTop: space.sm,
          }}
        >
          <IconButton name="arrow-back" label={t.common.back} onPress={handleBack} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            icon="movie-filter"
            title={hasUnknownDuration ? t.editor.durationUnknown : t.editor.emptyTitle}
            body={hasUnknownDuration ? t.editor.durationUnknownBody : t.editor.emptyBody}
            actionLabel={hasUnknownDuration ? t.success.editAgain : t.editor.emptyCta}
            onAction={() => router.replace(`/editor/${project.id}`)}
          />
        </View>
      </Screen>
    );
  }

  const header = (
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
      <IconButton name="arrow-back" label={t.common.back} onPress={handleBack} />
      <View style={{ flex: 1 }}>
        <ThemedText variant="body" weight="semibold" numberOfLines={1}>
          {t.exportScreen.title}
        </ThemedText>
        <ThemedText variant="caption" tone="tertiary" numberOfLines={1}>
          {project.title.trim() || t.projects.untitled}
        </ThemedText>
      </View>
      <PrototypePill />
    </View>
  );

  if (phase === 'exporting') {
    return (
      <Screen edges={['top', 'left', 'right']}>
        {header}
        <View
          style={{
            flex: 1,
            paddingHorizontal: layout.screenPadding,
            paddingTop: space.lg,
            justifyContent: 'center',
            gap: space.lg,
            width: '100%',
            maxWidth: layout.contentMaxWidth,
            alignSelf: 'center',
          }}
        >
          <View style={{ alignItems: 'center', gap: space.xs }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: radius.pill,
                backgroundColor: theme.colors.accentSoft,
                borderWidth: 1,
                borderColor: theme.colors.accentBorder,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="file-download" size={32} color={theme.colors.accent} />
            </View>
            <ThemedText
              variant="display"
              accessibilityLiveRegion="polite"
              numeric
              style={{ marginTop: space.xs }}
            >
              {`${Math.round(progress * 100)}%`}
            </ThemedText>
            <ThemedText variant="body" tone="secondary" accessibilityLiveRegion="polite">
              {stageLabel}
            </ThemedText>
          </View>

          <View style={{ gap: space.xs }}>
            <View
              accessibilityRole="progressbar"
              accessibilityLabel={t.exportScreen.progressLabel}
              accessibilityValue={{
                min: 0,
                max: 100,
                now: Math.round(progress * 100),
              }}
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.colors.surfaceSunken,
                borderWidth: 1,
                borderColor: theme.colors.border,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${Math.min(100, Math.max(2, progress * 100))}%`,
                  height: '100%',
                  borderRadius: 4,
                  backgroundColor: theme.colors.accentFill,
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemedText variant="caption" tone="tertiary" numeric>
                {`${formatClock(totalDuration)} · ${t.exportScreen.quality} ${preset === '1080p60' ? '1080p 60' : preset}`}
              </ThemedText>
              <ThemedText variant="caption" tone="tertiary" numeric>
                {t.exportScreen.secondsLeft(remainingSeconds)}
              </ThemedText>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              gap: space.xs,
              padding: space.sm,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            }}
          >
            <Icon name="lock-outline" size={18} color={theme.colors.textTertiary} />
            <ThemedText variant="caption" tone="tertiary" style={{ flex: 1 }}>
              {t.exportScreen.prototypeNote}
            </ThemedText>
          </View>
        </View>

        <View
          style={{
            paddingHorizontal: layout.screenPadding,
            paddingTop: space.xs,
            paddingBottom: Math.max(insets.bottom, space.sm),
          }}
        >
          <Button
            label={t.exportScreen.cancel}
            variant="destructive"
            size="md"
            onPress={() => setCancelVisible(true)}
          />
        </View>

        <ConfirmDialog
          visible={cancelVisible}
          title={t.exportScreen.cancelTitle}
          body={t.exportScreen.cancelBody}
          confirmLabel={t.exportScreen.confirmCancel}
          cancelLabel={t.exportScreen.keepExporting}
          onCancel={() => setCancelVisible(false)}
          onConfirm={confirmCancel}
        />
      </Screen>
    );
  }

  const ratioOptions = [
    { value: '9:16' as Aspect, label: t.exportScreen.aspectVertical },
    { value: '1:1' as Aspect, label: t.exportScreen.aspectSquare },
    { value: '16:9' as Aspect, label: t.exportScreen.aspectWide },
  ];

  const qualityOptions = [
    { value: '720p' as PresetId, label: '720p', hint: t.exportScreen.quality720Note },
    { value: '1080p' as PresetId, label: '1080p', hint: t.exportScreen.quality1080Note },
    { value: '1080p60' as PresetId, label: '1080p 60', hint: t.exportScreen.quality108060Note },
  ];

  const summaryRows: { icon: IconName; label: string; value: string }[] = [
    { icon: 'schedule', label: t.exportScreen.duration, value: formatClock(totalDuration) },
    {
      icon: 'movie-filter',
      label: t.exportScreen.clips,
      value: String(clips.length),
    },
    {
      icon: 'sd',
      label: t.exportScreen.size,
      value: `~${formatBytes(estimate.bytes, language)}`,
    },
  ];

  return (
    <Screen edges={['top', 'left', 'right']}>
      {header}
      <ScrollView
        style={{ width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center' }}
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: space.sm,
          paddingBottom: space.lg,
          gap: space.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 2 }}>
          <ThemedText variant="display" accessibilityRole="header">
            {t.exportScreen.title}
          </ThemedText>
          <ThemedText variant="body" tone="secondary">
            {t.exportScreen.subtitle}
          </ThemedText>
        </View>

        <View>
          <SectionLabel>{t.exportScreen.ratio}</SectionLabel>
          <SegmentedControl
            options={ratioOptions}
            value={aspect}
            onChange={(next) => {
              void haptics('select');
              setAspect(next);
            }}
            accessibilityLabel={t.exportScreen.ratio}
          />
        </View>

        <View>
          <SectionLabel>{t.exportScreen.quality}</SectionLabel>
          <SegmentedControl
            options={qualityOptions}
            value={preset}
            onChange={(next) => {
              void haptics('select');
              setPreset(next);
            }}
            accessibilityLabel={t.exportScreen.quality}
          />
        </View>

        <View>
          <SectionLabel>{t.exportScreen.estimateTitle}</SectionLabel>
          <View
            style={{
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              padding: space.md,
              gap: space.sm,
            }}
          >
            {summaryRows.map((row, index) => (
              <View key={row.label}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                  <Icon name={row.icon} size={18} color={theme.colors.textSecondary} />
                  <ThemedText variant="body" tone="secondary" style={{ flex: 1 }}>
                    {row.label}
                  </ThemedText>
                  <ThemedText variant="body" weight="semibold" numeric>
                    {row.value}
                  </ThemedText>
                </View>
                {index < summaryRows.length - 1 ? (
                  <View
                    style={{
                      height: 1,
                      marginTop: space.sm,
                      backgroundColor: theme.colors.border,
                    }}
                  />
                ) : null}
              </View>
            ))}
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            gap: space.xs,
            padding: space.sm,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: theme.colors.warningBorder,
            backgroundColor: theme.colors.warningSoft,
          }}
        >
          <Icon name="info-outline" size={18} color={theme.colors.warning} />
          <ThemedText variant="caption" style={{ color: theme.colors.warning, flex: 1 }}>
            {t.exportScreen.prototypeNote}
          </ThemedText>
        </View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: space.xs,
          paddingBottom: Math.max(insets.bottom, space.sm),
          backgroundColor: theme.colors.bg,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}
      >
        <Button
          label={t.exportScreen.start}
          icon="file-download"
          onPress={startExport}
        />
      </View>
    </Screen>
  );
}
