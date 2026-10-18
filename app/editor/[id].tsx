import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ClipPreview } from '@/components/ClipPreview';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { Notice } from '@/components/Notice';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState } from '@/components/StateViews';
import { Timeline } from '@/components/Timeline';
import { TrimBar } from '@/components/TrimBar';
import { ThemedText } from '@/components/ThemedText';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/i18n';
import { createId, useProjects } from '@/store/projects';
import { absoluteFill, layout, radius, space } from '@/theme/tokens';
import { Aspect } from '@/types';
import {
  canSplitClip,
  clipDuration,
  projectDuration,
  splitClipAt,
} from '@/utils/media';
import { formatClock } from '@/utils/format';
import { goToProjects } from '@/utils/navigation';

const ASPECT_RATIO: Record<Aspect, number> = {
  '9:16': 9 / 16,
  '1:1': 1,
  '16:9': 16 / 9,
};

function ActionTile({
  icon,
  label,
  onPress,
  disabled = false,
}: {
  icon: 'chevron-left' | 'content-cut' | 'chevron-right';
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 64,
        paddingHorizontal: 6,
        paddingVertical: space.xs,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: pressed ? theme.colors.surfaceSunken : theme.colors.surfaceRaised,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        opacity: disabled ? 0.4 : 1,
      })}
    >
      <Icon name={icon} size={22} color={theme.colors.text} />
      <ThemedText variant="caption" tone="secondary" numberOfLines={2} style={{ textAlign: 'center' }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export default function EditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useI18n();
  const haptics = useHaptics();
  const { getProject, updateProject } = useProjects();
  const { width, height } = useWindowDimensions();

  const project = getProject(id);
  const clips = project?.clips ?? [];
  const isLandscape = width > height;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(clips.length > 0 ? 0 : null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [playhead, setPlayhead] = useState(clips[0]?.trimStart ?? 0);
  const [notice, setNotice] = useState<{ text: string; kind: 'success' | 'warning' } | null>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [errorClipId, setErrorClipId] = useState<string | null>(null);

  const activeClip = clips.length > 0 ? clips[Math.min(activeIndex, clips.length - 1)] : undefined;
  const selectedClip = selectedIndex !== null ? clips[selectedIndex] : undefined;
  const totalDuration = projectDuration(clips);
  const hasUnknownDuration = clips.some((clip) => clipDuration(clip) <= 0);
  const canExport = clips.length > 0 && totalDuration >= 0.5 && !hasUnknownDuration;

  useEffect(() => {
    if (clips.length === 0) {
      setSelectedIndex(null);
      setActiveIndex(0);
      setPlayhead(0);
      setPlaying(false);
      return;
    }
    if (selectedIndex !== null && selectedIndex > clips.length - 1) {
      setSelectedIndex(clips.length - 1);
    }
    if (activeIndex > clips.length - 1) {
      setActiveIndex(clips.length - 1);
    }
  }, [clips.length, activeIndex, selectedIndex]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3200);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    setPlaying(false);
    setErrorClipId(null);
  }, [project?.id]);

  const handleClipEnd = useCallback(() => {
    if (clips.length === 0) return;
    if (activeIndex < clips.length - 1) {
      const next = clips[activeIndex + 1];
      setActiveIndex(activeIndex + 1);
      setPlayhead(next.trimStart);
    } else {
      setPlaying(false);
      setPlayhead(clips[activeIndex].trimEnd);
    }
  }, [clips, activeIndex]);

  const handleTogglePlay = useCallback(() => {
    if (!clips.length || totalDuration < 0.5) return;
    void haptics('select');
    if (!playing) {
      const current = clips[activeIndex];
      if (!current) return;
      if (playhead >= current.trimEnd - 0.05 || clipDuration(current) <= 0) {
        setActiveIndex(0);
        setPlayhead(clips[0].trimStart);
      }
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  }, [activeIndex, clips, haptics, playhead, playing, totalDuration]);

  const handleSelectClip = useCallback(
    (index: number) => {
      const clip = clips[index];
      if (!clip) return;
      void haptics('select');
      setSelectedIndex(index);
      setActiveIndex(index);
      setPlaying(false);
      setPlayhead(clip.trimStart);
      setErrorClipId(null);
    },
    [clips, haptics]
  );

  const handleProgress = useCallback((seconds: number) => {
    setPlayhead(seconds);
  }, []);

  const handlePreviewError = useCallback(() => {
    if (activeClip) setErrorClipId(activeClip.id);
  }, [activeClip]);

  const handleTrimChange = useCallback(
    (start: number, end: number) => {
      if (!project || selectedIndex === null) return;
      const index = selectedIndex;
      updateProject(project.id, (current) => ({
        ...current,
        status: 'draft',
        clips: current.clips.map((clip, clipIndex) =>
          clipIndex === index
            ? {
                ...clip,
                trimStart: Math.max(0, Math.min(start, end - 0.1)),
                trimEnd: end,
                durationUnknown: false,
              }
            : clip
        ),
      }));
      setPlayhead(start);
      setPlaying(false);
    },
    [project, selectedIndex, updateProject]
  );

  const handleTrimCommit = useCallback(() => {
    void haptics('impact');
  }, [haptics]);

  const handleMoveClip = useCallback(
    (delta: -1 | 1) => {
      if (!project || selectedIndex === null) return;
      const target = selectedIndex + delta;
      if (target < 0 || target > clips.length - 1) return;
      const source = selectedIndex;
      updateProject(project.id, (current) => {
        const next = [...current.clips];
        const [moved] = next.splice(source, 1);
        next.splice(target, 0, moved);
        return { ...current, clips: next, status: 'draft' };
      });
      setSelectedIndex(target);
      if (activeIndex === source) setActiveIndex(target);
      setPlaying(false);
      setPlayhead(clips[target]?.trimStart ?? 0);
      void haptics('impact');
    },
    [activeIndex, clips, haptics, project, selectedIndex, updateProject]
  );

  const handleSplit = useCallback(() => {
    if (!project || selectedIndex === null) return;
    const clip = project.clips[selectedIndex];
    if (!clip) return;
    const at = activeIndex === selectedIndex ? playhead : clip.trimStart;
    if (!canSplitClip(clip, at)) {
      setNotice({ text: t.editor.splitTooShort, kind: 'warning' });
      void haptics('warning');
      return;
    }
    const [first, second] = splitClipAt(clip, at, createId);
    updateProject(project.id, (current) => {
      const next = [...current.clips];
      next.splice(selectedIndex, 1, first, second);
      return { ...current, clips: next, status: 'draft' };
    });
    setActiveIndex(selectedIndex);
    setPlayhead(first.trimStart);
    setPlaying(false);
    setNotice({ text: t.editor.splitDone, kind: 'success' });
    void haptics('success');
  }, [activeIndex, haptics, playhead, project, selectedIndex, t, updateProject]);

  const handleDeleteClip = useCallback(() => {
    if (!project || selectedIndex === null) return;
    const index = selectedIndex;
    const remaining = project.clips.filter((_, clipIndex) => clipIndex !== index);
    updateProject(project.id, (current) => ({
      ...current,
      status: 'draft',
      clips: current.clips.filter((_, clipIndex) => clipIndex !== index),
    }));
    const nextIndex = remaining.length > 0 ? Math.min(index, remaining.length - 1) : null;
    setSelectedIndex(nextIndex);
    setActiveIndex(nextIndex ?? 0);
    setPlayhead(nextIndex !== null ? remaining[nextIndex].trimStart : 0);
    setPlaying(false);
    setDeleteVisible(false);
    setErrorClipId(null);
    void haptics('warning');
  }, [haptics, project, selectedIndex, updateProject]);

  const handleBack = useCallback(() => {
    setPlaying(false);
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/projects');
  }, [router]);

  const openAddClips = useCallback(() => {
    if (!project) return;
    setPlaying(false);
    void haptics('impact');
    router.push(`/select?projectId=${project.id}`);
  }, [haptics, project, router]);

  const openExport = useCallback(() => {
    if (!project || !canExport) return;
    setPlaying(false);
    void haptics('impact');
    router.push(`/export/${project.id}`);
  }, [canExport, haptics, project, router]);

  const previewSize = useMemo(() => {
    const ratio = ASPECT_RATIO[project?.aspect ?? '9:16'];
    const availableWidth = isLandscape
      ? Math.min(width * 0.5, 560) - space.lg * 2
      : Math.min(width, layout.contentMaxWidth) - layout.screenPadding * 2;
    const availableHeight = isLandscape
      ? Math.max(180, height * 0.6)
      : Math.max(180, height * 0.38);
    const previewWidth = Math.max(
      80,
      Math.min(availableWidth, availableHeight * ratio)
    );
    return { width: previewWidth, height: previewWidth / ratio };
  }, [height, isLandscape, project?.aspect, width]);

  const overviewProgress = useMemo(() => {
    if (!activeClip || totalDuration <= 0) return 0;
    const before = clips
      .slice(0, activeIndex)
      .reduce((sum, clip) => sum + clipDuration(clip), 0);
    const inside = Math.min(
      Math.max(0, playhead - activeClip.trimStart),
      clipDuration(activeClip)
    );
    return Math.min(1, Math.max(0, (before + inside) / totalDuration));
  }, [activeClip, activeIndex, clips, playhead, totalDuration]);

  const timelineProgress =
    activeClip && clipDuration(activeClip) > 0
      ? Math.min(1, Math.max(0, (playhead - activeClip.trimStart) / clipDuration(activeClip)))
      : 0;

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
          {project.title.trim() || t.editor.titleFallback}
        </ThemedText>
        <ThemedText variant="caption" tone="tertiary" numeric numberOfLines={1}>
          {t.editor.meta(clips.length, formatClock(totalDuration))}
        </ThemedText>
      </View>
      <IconButton
        name="add-photo-alternate"
        label={t.editor.addClips}
        onPress={openAddClips}
        variant="surface"
      />
    </View>
  );

  const previewPanel = (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: layout.screenPadding,
        paddingTop: space.xs,
        paddingBottom: space.sm,
      }}
    >
      <View
        style={{
          width: previewSize.width,
          height: previewSize.height,
          borderRadius: radius.lg,
          overflow: 'hidden',
          backgroundColor: theme.colors.videoBg,
          borderWidth: 1,
          borderColor: theme.colors.borderStrong,
        }}
      >
        {activeClip ? (
          <ClipPreview
            key={activeClip.id}
            clip={activeClip}
            playing={playing}
            muted={muted}
            onProgress={handleProgress}
            onEnd={handleClipEnd}
            onError={handlePreviewError}
            onTogglePlay={handleTogglePlay}
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="movie" size={30} color={theme.colors.textTertiary} />
          </View>
        )}

        {errorClipId && activeClip?.id === errorClipId ? (
          <View
            style={{
              ...absoluteFill,
              backgroundColor: theme.colors.scrim,
              padding: space.md,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: '100%',
                maxWidth: 300,
                backgroundColor: theme.colors.surfaceRaised,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
                padding: space.md,
                alignItems: 'center',
                gap: space.xs,
              }}
            >
              <Icon name="error-outline" size={24} color={theme.colors.warning} />
              <ThemedText variant="body" weight="semibold" style={{ textAlign: 'center' }}>
                {t.editor.previewError}
              </ThemedText>
              <ThemedText variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
                {t.editor.previewErrorBody}
              </ThemedText>
              <Button
                label={t.editor.removeClip}
                variant="destructive"
                size="md"
                fullWidth={false}
                onPress={() => setDeleteVisible(true)}
                style={{ marginTop: space.xxs }}
              />
            </View>
          </View>
        ) : null}

        {clips.length > 0 ? (
          <View
            pointerEvents="box-none"
            style={{ ...absoluteFill, justifyContent: 'space-between' }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: space.xs,
              }}
            >
              <View
                style={{
                  paddingHorizontal: space.xs,
                  paddingVertical: 4,
                  borderRadius: radius.pill,
                  backgroundColor: theme.colors.mediaControl,
                }}
              >
                <ThemedText
                  variant="caption"
                  style={{ color: theme.colors.onMedia, fontSize: 11, lineHeight: 14 }}
                  numeric
                >
                  {`${Math.min(activeIndex + 1, clips.length)}/${clips.length}`}
                </ThemedText>
              </View>
              <IconButton
                name={muted ? 'volume-off' : 'volume-up'}
                label={muted ? t.editor.unmute : t.editor.mute}
                onPress={() => {
                  setMuted((current) => !current);
                  void haptics('select');
                }}
                variant="overlay"
                size={40}
                selected={muted}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                padding: space.xs,
              }}
            >
              <View
                style={{
                  paddingHorizontal: space.xs,
                  paddingVertical: 4,
                  borderRadius: radius.pill,
                  backgroundColor: theme.colors.mediaControl,
                }}
              >
                <ThemedText
                  variant="caption"
                  style={{ color: theme.colors.onMedia, fontSize: 11, lineHeight: 14 }}
                  numeric
                >
                  {`${formatClock(playhead - (activeClip?.trimStart ?? 0))} / ${formatClock(
                    activeClip ? clipDuration(activeClip) : 0
                  )}`}
                </ThemedText>
              </View>
            </View>

            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                backgroundColor: theme.colors.mediaTrack,
              }}
            >
              <View
                style={{
                  width: `${overviewProgress * 100}%`,
                  height: 3,
                  backgroundColor: theme.colors.accent,
                }}
              />
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );

  const detailsPanel = (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingHorizontal: layout.screenPadding,
        paddingTop: isLandscape ? space.xs : space.xxs,
        paddingBottom: space.lg,
        gap: space.md,
        width: '100%',
        maxWidth: isLandscape ? undefined : layout.contentMaxWidth,
        alignSelf: 'center',
      }}
      showsVerticalScrollIndicator={false}
    >
      {clips.length === 0 ? (
        <EmptyState
          icon="movie-filter"
          title={t.editor.emptyTitle}
          body={t.editor.emptyBody}
          actionLabel={t.editor.emptyCta}
          onAction={openAddClips}
        />
      ) : (
        <>
          <Timeline
            clips={clips}
            selectedIndex={selectedIndex}
            onSelect={handleSelectClip}
            onAdd={openAddClips}
            playingClipIndex={playing ? activeIndex : null}
            playingProgress={timelineProgress}
          />

          {notice ? <Notice text={notice.text} kind={notice.kind} /> : null}

          {hasUnknownDuration ? (
            <ErrorState
              title={t.editor.durationUnknown}
              body={t.editor.durationUnknownBody}
              tone="warning"
              icon="movie"
            />
          ) : null}

          {selectedClip ? (
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
                padding: space.md,
                gap: space.sm,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: space.xs,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="content-cut" size={18} color={theme.colors.accent} />
                  <ThemedText variant="body" weight="semibold">
                    {t.editor.trimTitle}
                  </ThemedText>
                </View>
                <ThemedText variant="caption" tone="tertiary" numeric>
                  {`${t.editor.clipLabel((selectedIndex ?? 0) + 1, clips.length)} · ${formatClock(
                    clipDuration(selectedClip)
                  )}`}
                </ThemedText>
              </View>

              {clipDuration(selectedClip) <= 0 ? (
                <ErrorState
                  title={t.editor.durationUnknown}
                  body={t.editor.durationUnknownBody}
                  tone="warning"
                  retryLabel={t.editor.removeClip}
                  onRetry={() => setDeleteVisible(true)}
                />
              ) : (
                <TrimBar
                  uri={selectedClip.uri}
                  duration={Math.max(selectedClip.sourceDuration, selectedClip.trimEnd)}
                  start={selectedClip.trimStart}
                  end={selectedClip.trimEnd}
                  startLabel={t.editor.trimStart}
                  endLabel={t.editor.trimEnd}
                  onChange={handleTrimChange}
                  onCommit={handleTrimCommit}
                  incrementLabel={t.a11y.increase}
                  decrementLabel={t.a11y.decrease}
                />
              )}

              <View style={{ flexDirection: 'row', gap: space.xs }}>
                <ActionTile
                  icon="chevron-left"
                  label={t.editor.moveLeft}
                  onPress={() => handleMoveClip(-1)}
                  disabled={(selectedIndex ?? 0) <= 0}
                />
                <ActionTile
                  icon="content-cut"
                  label={t.editor.split}
                  onPress={handleSplit}
                  disabled={clipDuration(selectedClip) <= 0}
                />
                <ActionTile
                  icon="chevron-right"
                  label={t.editor.moveRight}
                  onPress={() => handleMoveClip(1)}
                  disabled={(selectedIndex ?? 0) >= clips.length - 1}
                />
              </View>

              <ThemedText variant="caption" tone="tertiary">
                {t.editor.splitHint}
              </ThemedText>

              <Button
                label={t.editor.deleteClip}
                icon="delete-outline"
                variant="destructive"
                size="md"
                fullWidth={false}
                onPress={() => setDeleteVisible(true)}
                style={{ paddingHorizontal: 0, alignSelf: 'flex-start' }}
              />
            </View>
          ) : (
            <ThemedText variant="caption" tone="tertiary">
              {t.editor.selectClip}
            </ThemedText>
          )}

          <ThemedText variant="caption" tone="tertiary">
            {t.editor.autoSaved}
          </ThemedText>
        </>
      )}
    </ScrollView>
  );

  const footer = (
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
      {clips.length === 0 ? (
        <Button label={t.editor.emptyCta} icon="add-photo-alternate" onPress={openAddClips} />
      ) : (
        <Button
          label={t.exportScreen.title}
          icon="file-download"
          onPress={openExport}
          disabled={!canExport}
          accessibilityLabel={t.exportScreen.start}
        />
      )}
    </View>
  );

  return (
    <Screen edges={['top', 'left', 'right']}>
      {header}
      {isLandscape ? (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 1, justifyContent: 'center' }}>{previewPanel}</View>
          <View style={{ flex: 1 }}>{detailsPanel}</View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {previewPanel}
          {detailsPanel}
        </View>
      )}
      {footer}

      <ConfirmDialog
        visible={deleteVisible}
        title={t.editor.deleteClipTitle}
        body={t.editor.deleteClipBody}
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        onCancel={() => setDeleteVisible(false)}
        onConfirm={handleDeleteClip}
      />
    </Screen>
  );
}

