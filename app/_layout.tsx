import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import { PreferencesProvider, usePreferences } from '@/store/preferences';
import { ProjectsProvider, useProjects } from '@/store/projects';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

function AppShell() {
  const { theme } = useTheme();
  const { hydrated: preferencesReady } = usePreferences();
  const { hydrated: projectsReady } = useProjects();

  useEffect(() => {
    if (Platform.OS === 'web') return;
    void SystemUI.setBackgroundColorAsync(theme.colors.bg).catch(() => undefined);
  }, [theme.colors.bg]);

  useEffect(() => {
    if (!preferencesReady || !projectsReady) return;
    const timer = setTimeout(() => {
      void SplashScreen.hideAsync().catch(() => undefined);
    }, 60);
    return () => clearTimeout(timer);
  }, [preferencesReady, projectsReady]);

  const ready = preferencesReady && projectsReady;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <StatusBar style={theme.statusBarStyle} />
      {ready ? (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.bg },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen
            name="select"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="editor/[id]" />
          <Stack.Screen name="export/[id]" />
          <Stack.Screen
            name="success/[id]"
            options={{ animation: 'fade', gestureEnabled: false }}
          />
          <Stack.Screen name="legal/[doc]" />
        </Stack>
      ) : null}
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PreferencesProvider>
        <ProjectsProvider>
          <AppShell />
        </ProjectsProvider>
      </PreferencesProvider>
    </SafeAreaProvider>
  );
}
