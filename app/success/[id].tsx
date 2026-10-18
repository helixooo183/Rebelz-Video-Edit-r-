import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Icon, IconName } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { Notice } from '@/components/Notice';
import { PrototypePill } from '@/components/PrototypePill';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/StateViews';
import { ThemedText } from '@/components/ThemedText';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/i18n';
import { useProjects } from '@/store/projects';
import { layout, radius, space } from '@/theme/tokens';
import { formatClock, formatBytes } from '@/utils/format';
import { projectDuration } from '@/utils/media';
import { goToProjects } from '@/utils/navigation';

const RATIO_LABEL_KEY = {
  '9:16': 'aspectVertical',
  '1:1': 'aspectSquare',
  '16:9': 'aspectWide',
} as const;

export default function SuccessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t, language } = useI18n();
  const haptics = useHaptics();
  const { getProject } = useProjects();
  const [shareUnavailable, setShareUnavailable] = useState(false);

  const project = getProject(id);
  const lastExport = project?.lastExport;

  const duration = project ? projectDuration(project.clips) : 0;
  const title = project?.title.trim() || t.projects.untitled;

  const rows = useMemo(() => {
    if (!lastExport) return [];
    const ratioLabel = t.exportScreen[RATIO_LABEL_KEY[lastExport.aspect]];
    const quality =
      lastExport.preset === '1080p60'
        ? '1080p 60'
        : lastExport.preset;
    return [
      { icon: 'aspect-ratio' as IconName, label: t.success.ratio, value: ratioLabel },
      { icon: 'high-quality' as IconName, label: t.success.quality, value: quality },
      { icon: 'schedule' as IconName, label: t.success.duration, value: formatClock(duration) },
      {
        icon: 'sd' as IconName,
        label: t.success.size,
        value: formatBytes(lastExport.sizeBytes, language),
      },
    ];
  }, [duration, language, lastExport, t]);

  const goProjects = () => {
    void haptics('select');
    goToProjects(router);
  };

  const handleShare = async () => {
    void haptics('impact');
    try {
      await Share.share({ message: t.success.shareMessage(title) });
      setShareUnavailable(false);
    } catch {
      setShareUnavailable(true);
    }
  };

  const header = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: layout.screenPadding,
        paddingTop: space.xxs,
        paddingBottom: space.xs,
      }}
    >
      <IconButton
        name="close"
        label={t.common.close}
        onPress={goProjects}
        variant="surface"
      />
      <PrototypePill />
    </View>
  );

  if (!project || !lastExport) {
    return (
      <Screen>
        {header}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            icon="error-outline"
            title={t.exportScreen.noProject}
            body={t.exportScreen.noProjectBody}
            actionLabel={t.success.backToProjects}
            onAction={goProjects}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      {header}
      <ScrollView
        style={{ width: '100%', maxWidth: 560, alignSelf: 'center' }}
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: space.md,
          paddingBottom: space.lg,
          gap: space.lg,
          flexGrow: 1,
          justifyContent: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', gap: space.xs }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: radius.pill,
              backgroundColor: theme.colors.successSoft,
              borderWidth: 1,
              borderColor: theme.colors.successBorder,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="check" size={38} color={theme.colors.success} />
          </View>
          <ThemedText
            variant="display"
            accessibilityRole="header"
            style={{ textAlign: 'center', marginTop: space.xs }}
          >
            {t.success.title}
          </ThemedText>
          <ThemedText
            variant="body"
            tone="secondary"
            style={{ textAlign: 'center', maxWidth: 360 }}
          >
            {t.success.body}
          </ThemedText>
        </View>

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
          <ThemedText variant="caption" weight="semibold" tone="tertiary" style={{ letterSpacing: 0.8 }}>
            {t.success.summaryTitle.toUpperCase()}
          </ThemedText>
          {rows.map((row, index) => (
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
              {index < rows.length - 1 ? (
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

        {shareUnavailable ? <Notice text={t.success.shareUnavailable} kind="warning" /> : null}

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
            {t.success.prototypeNote}
          </ThemedText>
        </View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: space.xs,
          paddingBottom: Math.max(insets.bottom, space.sm),
          gap: space.xxs,
          width: '100%',
          maxWidth: 560,
          alignSelf: 'center',
        }}
      >
        <Button label={t.success.share} icon="share" onPress={() => void handleShare()} />
        <Button label={t.success.backToProjects} onPress={goProjects} variant="secondary" />
        <Button
          label={t.success.editAgain}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace(`/editor/${project.id}`);
          }}
          variant="text"
          size="md"
        />
      </View>
    </Screen>
  );
}
