import { createVideoPlayer } from 'expo-video';
import { Platform } from 'react-native';

function probeWebDuration(uri: string): Promise<number> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(0);
      return;
    }
    const video = document.createElement('video');
    let settled = false;
    const finish = (value: number) => {
      if (settled) return;
      settled = true;
      video.removeAttribute('src');
      video.load();
      resolve(Number.isFinite(value) && value > 0 ? value : 0);
    };
    video.preload = 'metadata';
    video.onloadedmetadata = () => finish(video.duration);
    video.onerror = () => finish(0);
    video.src = uri;
    setTimeout(() => finish(0), 6000);
  });
}

function probeNativeDuration(uri: string): Promise<number> {
  return new Promise((resolve) => {
    let player: ReturnType<typeof createVideoPlayer> | null = null;
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const finish = (value: number) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      try {
        subscriptions.forEach((subscription) => subscription.remove());
        player?.release();
      } catch {
        // Oynatıcı zaten bırakılmış olabilir.
      }
      resolve(Number.isFinite(value) && value > 0 ? value : 0);
    };

    const subscriptions: { remove: () => void }[] = [];

    try {
      player = createVideoPlayer({ uri });
      subscriptions.push(
        player.addListener('sourceLoad', (payload) => finish(payload.duration))
      );
      subscriptions.push(
        player.addListener('statusChange', (payload) => {
          if (payload.status === 'error') finish(0);
        })
      );
      timer = setTimeout(() => finish(player?.duration ?? 0), 6000);
    } catch {
      finish(0);
    }
  });
}

/**
 * Picker süre döndürmediyse videonun süresini okur.
 * Web'de HTMLVideoElement, native'de kısa ömürlü bir expo-video oynatıcısı kullanılır.
 */
export async function probeVideoDuration(uri: string): Promise<number> {
  if (!uri) return 0;
  if (Platform.OS === 'web') return probeWebDuration(uri);
  return probeNativeDuration(uri);
}
