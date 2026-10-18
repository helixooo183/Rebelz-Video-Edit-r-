import { Image } from 'expo-image';
import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { useClipThumbnail } from '@/hooks/useClipThumbnail';
import { radius } from '@/theme/tokens';
import { Icon } from './Icon';

type Props = {
  uri?: string;
  timeMs?: number;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
  rounded?: number;
  accessibilityLabel?: string;
};

/** Video karesi; kare üretilemezse (web/desteklenmeyen dosya) nötr yer tutucu gösterir. */
export function VideoThumb({
  uri,
  timeMs = 0,
  style,
  iconSize = 20,
  rounded = radius.md,
  accessibilityLabel,
}: Props) {
  const { theme } = useTheme();
  const thumbnail = useClipThumbnail(uri, timeMs);

  return (
    <View
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      style={[
        {
          overflow: 'hidden',
          borderRadius: rounded,
          backgroundColor: theme.colors.videoBg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {thumbnail ? (
        <Image
          source={{ uri: thumbnail }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={120}
        />
      ) : (
        <Icon name="movie" size={iconSize} color={theme.colors.textTertiary} />
      )}
    </View>
  );
}
