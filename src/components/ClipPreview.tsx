import { useEventListener } from 'expo';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/i18n';
import { absoluteFill, radius } from '@/theme/tokens';
import { Clip } from '@/types';
import { Icon } from './Icon';
import { ThemedText } from './ThemedText';

type Props = {
  clip: Clip;
  playing: boolean;
  muted: boolean;
  onProgress: (seconds: number) => void;
  onEnd: () => void;
  onError: () => void;
  onTogglePlay: () => void;
};

/**
 * Tek klibin önizlemesi. Klip değişince bileşen yeniden kurulur; böylece
 * kırpma aralığı dışına taşan oynatma olmaz. Süre sınırında duraklatıp sıradaki klibe geçilir.
 */
export function ClipPreview({
  clip,
  playing,
  muted,
  onProgress,
  onEnd,
  onError,
  onTogglePlay,
}: Props) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const endedRef = useRef(false);

  const player = useVideoPlayer({ uri: clip.uri }, (instance) => {
    instance.timeUpdateEventInterval = 0.15;
    instance.loop = false;
    instance.muted = muted;
    instance.currentTime = clip.trimStart;
  });

  useEventListener(player, 'statusChange', ({ status, error }) => {
    if (status === 'readyToPlay') {
      setReady(true);
      if (Math.abs(player.currentTime - clip.trimStart) > 0.25 && !playingRef.current) {
        player.currentTime = clip.trimStart;
      }
      if (playingRef.current) player.play();
    }
    if (status === 'error' || error) {
      setFailed(true);
      onError();
    }
  });

  useEventListener(player, 'timeUpdate', ({ currentTime }) => {
    if (currentTime >= clip.trimEnd - 0.03) {
      if (endedRef.current) return;
      endedRef.current = true;
      player.pause();
      onEnd();
      return;
    }
    if (currentTime >= clip.trimStart - 0.05) {
      onProgress(currentTime);
    }
  });

  useEventListener(player, 'playToEnd', () => {
    if (endedRef.current) return;
    endedRef.current = true;
    onEnd();
  });

  useEffect(() => {
    endedRef.current = false;
  }, [clip.id, clip.trimEnd]);

  useEffect(() => {
    if (playing) {
      player.play();
    } else {
      player.pause();
    }
  }, [playing, player]);

  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  useEffect(() => {
    if (!playing) {
      try {
        player.currentTime = clip.trimStart;
      } catch {
        // Oynatıcı henüz hazır değilse statusChange yeniden dener.
      }
    }
  }, [clip.trimStart, clip.id, playing, player]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.videoBg }}>
      <VideoView
        player={player}
        nativeControls={false}
        contentFit="contain"
        playsInline
        surfaceType={Platform.OS === 'android' ? 'textureView' : undefined}
        style={StyleSheet.absoluteFill}
      />

      {!failed ? (
        <Pressable
          onPress={onTogglePlay}
          accessibilityRole="button"
          accessibilityLabel={playing ? t.editor.pause : t.editor.play}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      {!ready && !failed ? (
        <View
          pointerEvents="none"
          style={{
            ...absoluteFill,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.videoBg,
          }}
        >
          <ActivityIndicator color={theme.colors.accent} />
        </View>
      ) : null}

      {!playing && ready && !failed ? (
        <View
          pointerEvents="none"
          style={{
            ...absoluteFill,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: radius.pill,
              backgroundColor: theme.colors.mediaControl,
              borderWidth: 1,
              borderColor: theme.colors.mediaBorder,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="play-arrow" size={34} color={theme.colors.onMedia} />
          </View>
          <ThemedText
            variant="caption"
            style={{ color: theme.colors.onMedia, marginTop: 8, opacity: 0.85 }}
          >
            {t.editor.playbackHint}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}
