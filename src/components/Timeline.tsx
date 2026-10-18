import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/i18n';
import { absoluteFill, radius, space } from '@/theme/tokens';
import { formatClock } from '@/utils/format';
import { clipDuration } from '@/utils/media';
import { Clip } from '@/types';
import { Icon } from './Icon';
import { ThemedText } from './ThemedText';
import { VideoThumb } from './VideoThumb';

type Props = {
  clips: Clip[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onAdd: () => void;
  playingClipIndex?: number | null;
  playingProgress?: number;
};

/** Zaman çizelgesi: her klip süresiyle orantılı bir blok; seçim ve oynatma konumu görünür. */
export function Timeline({
  clips,
  selectedIndex,
  onSelect,
  onAdd,
  playingClipIndex = null,
  playingProgress = 0,
}: Props) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const total = clips.reduce((sum, clip) => sum + clipDuration(clip), 0) || 1;

  return (
    <View style={{ gap: space.xs }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <ThemedText variant="caption" tone="tertiary">
          {t.editor.timelineHint}
        </ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="schedule" size={14} color={theme.colors.textTertiary} />
          <ThemedText variant="caption" tone="tertiary" numeric>
            {t.editor.total(formatClock(total))}
          </ThemedText>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: space.xs,
          paddingVertical: space.xxs,
          paddingRight: space.xs,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {clips.map((clip, index) => {
          const selected = index === selectedIndex;
          const duration = clipDuration(clip);
          const width = Math.round(64 + Math.min(1, duration / total) * 96);
          const active = playingClipIndex === index;
          return (
            <Pressable
              key={clip.id}
              onPress={() => onSelect(index)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={t.editor.clipA11y(index + 1, formatClock(duration))}
              accessibilityHint={t.editor.trimTitle}
              style={({ pressed }) => ({
                width,
                height: 68,
                borderRadius: radius.md,
                overflow: 'hidden',
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? theme.colors.accentFill : theme.colors.borderStrong,
                opacity: pressed ? 0.9 : 1,
                backgroundColor: theme.colors.videoBg,
              })}
            >
              <VideoThumb
                uri={clip.uri}
                timeMs={Math.round(clip.trimStart * 1000)}
                style={{ ...absoluteFill, borderRadius: 0 }}
                iconSize={18}
              />
              <View
                style={{
                  ...absoluteFill,
                  backgroundColor: selected ? theme.colors.mediaShadeSoft : theme.colors.mediaShade,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  top: 4,
                  left: 4,
                  minWidth: 20,
                  height: 20,
                  paddingHorizontal: 5,
                  borderRadius: radius.pill,
                  backgroundColor: selected
                    ? theme.colors.accentFill
                    : theme.colors.mediaControlStrong,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ThemedText
                  variant="caption"
                  weight="semibold"
                  style={{
                    color: selected ? theme.colors.onAccent : theme.colors.onMedia,
                    fontSize: 11,
                    lineHeight: 14,
                  }}
                >
                  {index + 1}
                </ThemedText>
              </View>
              <View
                style={{
                  position: 'absolute',
                  right: 4,
                  bottom: 4,
                  paddingHorizontal: 5,
                  paddingVertical: 2,
                  borderRadius: 6,
                  backgroundColor: theme.colors.mediaControl,
                }}
              >
                <ThemedText
                  variant="caption"
                  style={{ color: theme.colors.onMedia, fontSize: 11, lineHeight: 14 }}
                  numeric
                >
                  {formatClock(duration)}
                </ThemedText>
              </View>
              {active ? (
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${Math.min(100, Math.max(0, playingProgress * 100))}%`,
                    width: 2,
                    backgroundColor: theme.colors.accent,
                  }}
                />
              ) : null}
            </Pressable>
          );
        })}

        <Pressable
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel={t.editor.addClips}
          style={({ pressed }) => ({
            width: 56,
            height: 68,
            borderRadius: radius.md,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: theme.colors.borderStrong,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: pressed ? theme.colors.surfaceSunken : theme.colors.surface,
          })}
        >
          <Icon name="add" size={24} color={theme.colors.accent} />
        </Pressable>
      </ScrollView>
    </View>
  );
}
