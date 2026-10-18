import * as ImagePicker from 'expo-image-picker';

import { durationLimits } from '@/theme/tokens';
import { Clip } from '@/types';
import { createId } from '@/store/projects';
import { probeVideoDuration } from './probeDuration';

export type PickVideosResult =
  | { status: 'ok'; clips: Clip[] }
  | { status: 'cancelled' }
  | { status: 'permission-denied' }
  | { status: 'error'; reason: 'unsupported' }
  | { status: 'empty' };

/**
 * Galeriden video seçer ve Clip modeline dönüştürür.
 * Süre bilgisi eksikse kısa bir yoklama yapılır; hiçbir klip cihazdan çıkmaz.
 */
export async function pickVideos(maxCount: number): Promise<PickVideosResult> {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return { status: 'permission-denied' };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, Math.min(maxCount, durationLimits.maxClips)),
      orderedSelection: true,
      quality: 1,
      videoExportPreset: ImagePicker.VideoExportPreset.Passthrough,
    });

    if (result.canceled) return { status: 'cancelled' };
    if (!result.assets || result.assets.length === 0) return { status: 'empty' };

    const clips: Clip[] = [];
    for (const asset of result.assets) {
      if (!asset.uri) continue;
      let duration = asset.duration ? asset.duration / 1000 : 0;
      if (!duration) {
        duration = await probeVideoDuration(asset.uri);
      }
      clips.push({
        id: createId(),
        uri: asset.uri,
        sourceDuration: duration,
        trimStart: 0,
        trimEnd: duration,
        durationUnknown: duration <= 0,
      });
    }

    if (clips.length === 0) return { status: 'error', reason: 'unsupported' };
    return { status: 'ok', clips };
  } catch (error) {
    console.warn('[picker] video seçilemedi', error);
    return { status: 'error', reason: 'unsupported' };
  }
}
