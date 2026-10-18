import { Clip, PresetId, Project } from '@/types';
import { durationLimits, exportPresets } from '@/theme/tokens';

export function clipDuration(clip: Clip): number {
  const raw = Math.max(0, clip.trimEnd - clip.trimStart);
  return Number.isFinite(raw) ? raw : 0;
}

export function projectDuration(clips: Clip[]): number {
  return clips.reduce((total, clip) => total + clipDuration(clip), 0);
}

export function estimateExport(clips: Clip[], preset: PresetId) {
  const seconds = projectDuration(clips);
  const config = exportPresets[preset];
  const bytes = Math.round((config.bitrateMbps * 1_000_000 * seconds) / 8);
  return { seconds, bytes };
}

export function estimateExportSeconds(clips: Clip[], preset: PresetId): number {
  const seconds = projectDuration(clips);
  const config = exportPresets[preset];
  // Prototip: işlem süresi çıktı süresi ve kare hızıyla ölçeklenir. 6–40 sn arasında tutulur.
  const raw = 3 + seconds * 0.35 + (config.fps === 60 ? 2 : 0);
  return Math.round(Math.min(40, Math.max(6, raw)));
}

export function totalExceedsLimit(clips: Clip[]): boolean {
  return projectDuration(clips) > durationLimits.maxTotalSeconds;
}

export function canSplitClip(clip: Clip, atSeconds: number): boolean {
  const local = atSeconds - clip.trimStart;
  const remaining = clip.trimEnd - atSeconds;
  return local >= durationLimits.minClipSeconds && remaining >= durationLimits.minClipSeconds;
}

export function splitClipAt(clip: Clip, atSeconds: number, makeId: () => string): [Clip, Clip] {
  const first: Clip = { ...clip, trimEnd: atSeconds };
  const second: Clip = {
    ...clip,
    id: makeId(),
    trimStart: atSeconds,
  };
  return [first, second];
}

export function projectTitle(project: Project, fallback: string): string {
  return project.title.trim() || fallback;
}
