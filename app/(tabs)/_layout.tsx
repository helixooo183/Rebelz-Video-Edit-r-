import { Tabs } from 'expo-router/js-tabs';
import React from 'react';

import { BottomDock } from '@/components/BottomDock';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: 'transparent' },
      }}
      tabBar={(props) => <BottomDock {...props} />}
    >
      <Tabs.Screen name="projects" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
