import { Platform } from 'react-native';
import { useEffect, useState } from 'react';

type Thumbnailer = {
  getThumbnailAsync: (
    uri: string,
    options?: { time?: number; quality?: number }
  ) => Promise<{ uri: string; width: number; height: number }>;
};

const cache = new Map<string, string>();
const CACHE_LIMIT = 80;

let thumbnailerPromise: Promise<Thumbnailer | null> | null = null;

/**
 * Thumbnail modülü bazı çalışma ortamlarında bulunmayabilir (ör. web).
 * Bu yüzden yalnızca ihtiyaç anında yüklenir; hata sessizce yer tutucuya düşer.
 */
function loadThumbnailer(): Promise<Thumbnailer | null> {
  if (!thumbnailerPromise) {
    thumbnailerPromise = import('expo-video-thumbnails')
      .then((module) => module as unknown as Thumbnailer)
      .catch(() => null);
  }
  return thumbnailerPromise;
}

/** Yerel videodan kare üretir; üretilemezse null döner ve arayüz yer tutucu gösterir. */
export function useClipThumbnail(uri: string | undefined, timeMs = 0): string | null {
  const key = uri ? `${uri}#${Math.round(timeMs)}` : '';
  const [thumbnail, setThumbnail] = useState<string | null>(() =>
    key ? (cache.get(key) ?? null) : null
  );

  useEffect(() => {
    if (!uri || Platform.OS === 'web') {
      setThumbnail(null);
      return;
    }
    const cacheKey = `${uri}#${Math.round(timeMs)}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      setThumbnail(cached);
      return;
    }
    let active = true;
    loadThumbnailer()
      .then((module) => {
        if (!module) return null;
        return module.getThumbnailAsync(uri, { time: Math.max(0, timeMs), quality: 0.45 });
      })
      .then((result) => {
        if (!active || !result) return;
        cache.set(cacheKey, result.uri);
        if (cache.size > CACHE_LIMIT) {
          const first = cache.keys().next().value;
          if (first) cache.delete(first);
        }
        setThumbnail(result.uri);
      })
      .catch(() => {
        if (active) setThumbnail(null);
      });
    return () => {
      active = false;
    };
  }, [uri, timeMs]);

  return thumbnail;
}
