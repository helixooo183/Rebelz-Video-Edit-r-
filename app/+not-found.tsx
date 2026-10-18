import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/StateViews';
import { useI18n } from '@/i18n';
import { goToProjects } from '@/utils/navigation';

export default function NotFoundScreen() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState
          icon="link-off"
          title={t.meta.notFoundTitle}
          body={t.meta.notFoundBody}
          actionLabel={t.projects.title}
          onAction={() => goToProjects(router)}
        />
      </View>
    </Screen>
  );
}
