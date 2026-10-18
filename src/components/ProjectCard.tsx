import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/i18n';
import { radius, space } from '@/theme/tokens';
import { formatClock, formatRelativeTime } from '@/utils/format';
import { projectDuration } from '@/utils/media';
import { Project } from '@/types';
import { IconButton } from './IconButton';
import { ThemedText } from './ThemedText';
import { VideoThumb } from './VideoThumb';

type Props = {
  project: Project;
  onPress: () => void;
  onMenu: () => void;
  style?: object;
  exportedLabel: string;
  draftLabel: string;
};

export function ProjectCard({
  project,
  onPress,
  onMenu,
  style,
  exportedLabel,
  draftLabel,
}: Props) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const firstClip = project.clips[0];
  const title = project.title.trim() || t.projects.untitled;
  const seconds = projectDuration(project.clips);
  const meta = t.projects.clipsAndDuration(project.clips.length, formatClock(seconds));
  const relative = formatRelativeTime(project.updatedAt, t);
  const exported = project.status === 'exported';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t.projects.cardA11y(title, `${meta}, ${relative}`)}
      accessibilityHint={t.editor.play}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.sm,
          padding: space.sm,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          opacity: pressed ? 0.92 : 1,
        },
        theme.shadow.card,
        style,
      ]}
    >
      <VideoThumb
        uri={firstClip?.uri}
        timeMs={firstClip ? Math.round(firstClip.trimStart * 1000) : 0}
        style={styles.thumb}
        iconSize={20}
        accessibilityLabel={firstClip ? t.editor.clipLabel(1, project.clips.length) : undefined}
      />

      <View style={{ flex: 1, gap: 3 }}>
        <ThemedText variant="body" weight="semibold" numberOfLines={1}>
          {title}
        </ThemedText>
        <ThemedText variant="caption" tone="secondary" numberOfLines={1} numeric>
          {meta}
        </ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, marginTop: 2 }}>
          <View
            style={{
              paddingHorizontal: 7,
              paddingVertical: 2,
              borderRadius: radius.pill,
              backgroundColor: exported ? theme.colors.successSoft : theme.colors.surfaceSunken,
              borderWidth: 1,
              borderColor: exported ? theme.colors.successBorder : theme.colors.border,
            }}
          >
            <ThemedText
              variant="caption"
              style={{
                fontSize: 11,
                lineHeight: 14,
                color: exported ? theme.colors.success : theme.colors.textSecondary,
              }}
            >
              {exported ? exportedLabel : draftLabel}
            </ThemedText>
          </View>
          <ThemedText variant="caption" tone="tertiary" numberOfLines={1}>
            {relative}
          </ThemedText>
        </View>
      </View>

      <IconButton
        name="more-vert"
        label={t.projects.menuTitle}
        onPress={onMenu}
        size={44}
        style={{ alignSelf: 'flex-start' }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  thumb: {
    width: 64,
    height: 80,
  },
});
