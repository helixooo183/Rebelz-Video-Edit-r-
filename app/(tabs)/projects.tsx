import { useGlobalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState, ErrorState } from '@/components/StateViews';
import { ProjectCard } from '@/components/ProjectCard';
import { RenameProjectDialog } from '@/components/RenameProjectDialog';
import { Screen } from '@/components/Screen';
import { Sheet } from '@/components/Sheet';
import { Skeleton } from '@/components/Skeleton';
import { ThemedText } from '@/components/ThemedText';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/i18n';
import { useProjects } from '@/store/projects';
import { layout, radius, space } from '@/theme/tokens';
import { Project } from '@/types';

export default function ProjectsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useI18n();
  const haptics = useHaptics();
  const { projects, hydrated, storageError, deleteProject, updateProject, reload } = useProjects();
  const { width } = useWindowDimensions();
  const params = useGlobalSearchParams<{ new?: string }>();
  const autoOpenedRef = useRef(false);

  const [menuProject, setMenuProject] = useState<Project | null>(null);
  const [renameProject, setRenameProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const columns = width >= 720 ? 2 : 1;

  const openEditor = useCallback(
    (project: Project) => {
      void haptics('select');
      router.push(`/editor/${project.id}`);
    },
    [haptics, router]
  );

  const openSelect = useCallback(() => {
    void haptics('impact');
    router.push('/select');
  }, [haptics, router]);

  useEffect(() => {
    if (params.new !== '1' || !hydrated || autoOpenedRef.current) return;
    autoOpenedRef.current = true;
    router.setParams({ new: '' });
    openSelect();
  }, [hydrated, openSelect, params.new, router]);

  const skeleton = useMemo(
    () => (
      <View style={{ gap: space.sm, paddingTop: space.xs }}>
        {[0, 1, 2].map((key) => (
          <View
            key={key}
            style={{
              flexDirection: 'row',
              gap: space.sm,
              padding: space.sm,
              backgroundColor: theme.colors.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Skeleton style={{ width: 64, height: 80 }} />
            <View style={{ flex: 1, gap: space.xs, paddingTop: space.xxs }}>
              <Skeleton style={{ height: 14, width: '55%' }} />
              <Skeleton style={{ height: 11, width: '38%' }} />
              <Skeleton style={{ height: 11, width: '24%', marginTop: space.xs }} />
            </View>
          </View>
        ))}
      </View>
    ),
    [theme.colors.border, theme.colors.surface]
  );

  return (
    <Screen>
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingHorizontal: layout.screenPadding,
            paddingTop: space.sm,
            paddingBottom: space.sm,
            width: '100%',
            maxWidth: layout.contentMaxWidth,
            alignSelf: 'center',
          }}
        >
          <ThemedText variant="display" accessibilityRole="header">
            {t.projects.title}
          </ThemedText>
          <ThemedText variant="caption" tone="secondary" style={{ marginTop: 2 }}>
            {t.projects.subtitle}
          </ThemedText>
        </View>

        {storageError ? (
          <View style={{ paddingHorizontal: layout.screenPadding }}>
            <ErrorState
              title={t.projects.errorTitle}
              body={t.settings.storageError}
              retryLabel={t.common.retry}
              onRetry={() => void reload()}
            />
          </View>
        ) : !hydrated ? (
          <View style={{ paddingHorizontal: layout.screenPadding }}>{skeleton}</View>
        ) : (
          <FlatList
            data={projects}
            key={`projects-${columns}`}
            keyExtractor={(item) => item.id}
            numColumns={columns}
            style={{ width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center' }}
            contentContainerStyle={{
              paddingHorizontal: layout.screenPadding,
              paddingTop: space.xs,
              paddingBottom: space.lg,
              gap: space.sm,
              flexGrow: 1,
              justifyContent: projects.length === 0 ? 'center' : 'flex-start',
            }}
            columnWrapperStyle={columns > 1 ? { gap: space.sm } : undefined}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState
                icon="movie-filter"
                title={t.projects.emptyTitle}
                body={t.projects.emptyBody}
                caption={t.projects.emptyCaption}
                actionLabel={t.projects.emptyCta}
                onAction={openSelect}
              />
            }
            renderItem={({ item }) => (
              <ProjectCard
                project={item}
                onPress={() => openEditor(item)}
                onMenu={() => {
                  void haptics('select');
                  setMenuProject(item);
                }}
                style={columns > 1 ? styles.gridCard : undefined}
                exportedLabel={t.projects.badgeExported}
                draftLabel={t.projects.badgeDraft}
              />
            )}
          />
        )}
      </View>

      <Sheet
        visible={menuProject !== null}
        title={t.projects.menuTitle}
        onClose={() => setMenuProject(null)}
        cancelLabel={t.common.cancel}
        actions={
          menuProject
            ? [
                {
                  label: t.projects.rename,
                  icon: 'edit',
                  onPress: () => {
                    const target = menuProject;
                    setMenuProject(null);
                    setTimeout(() => setRenameProject(target), 180);
                  },
                },
                {
                  label: t.projects.delete,
                  icon: 'delete-outline',
                  destructive: true,
                  onPress: () => {
                    const target = menuProject;
                    setMenuProject(null);
                    setTimeout(() => setDeleteTarget(target), 180);
                  },
                },
              ]
            : []
        }
      />

      <RenameProjectDialog
        visible={renameProject !== null}
        initialValue={renameProject?.title ?? ''}
        onCancel={() => setRenameProject(null)}
        onSave={(title) => {
          if (renameProject) {
            updateProject(renameProject.id, (project) => ({ ...project, title }));
          }
          setRenameProject(null);
        }}
      />

      <ConfirmDialog
        visible={deleteTarget !== null}
        title={t.projects.deleteTitle}
        body={t.projects.deleteBody(
          deleteTarget ? deleteTarget.title.trim() || t.projects.untitled : ''
        )}
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteProject(deleteTarget.id);
            void haptics('warning');
          }
          setDeleteTarget(null);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  gridCard: {
    flex: 1,
    minWidth: 0,
  },
});
