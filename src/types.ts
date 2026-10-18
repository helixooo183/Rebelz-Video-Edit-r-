import { aspects, exportPresets } from '@/theme/tokens';

export type Aspect = (typeof aspects)[number];
export type PresetId = keyof typeof exportPresets;
export type Clip = {
  id: string;
  uri: string;
  /** Kaynak videonun toplam süresi (saniye). Bilinmiyorsa 0. */
  sourceDuration: number;
  /** Kırpma başlangıcı (saniye). */
  trimStart: number;
  /** Kırpma bitişi (saniye). */
  trimEnd: number;
  /** Süre okunamadıysa true; klip kullanılamaz sayılır. */
  durationUnknown?: boolean;
};

export type ExportRecord = {
  preset: PresetId;
  aspect: Aspect;
  sizeBytes: number;
  at: number;
};

export type ProjectStatus = 'draft' | 'exported';

export type Project = {
  id: string;
  /** Boşsa arayüzde yerelleştirilmiş "Yeni video" gösterilir. */
  title: string;
  clips: Clip[];
  aspect: Aspect;
  createdAt: number;
  updatedAt: number;
  status: ProjectStatus;
  lastExport?: ExportRecord;
};

export type ThemeMode = 'system' | 'light' | 'dark';
export type LanguageSetting = 'system' | 'tr' | 'en';
export type AppLanguage = 'tr' | 'en';

export type Preferences = {
  themeMode: ThemeMode;
  language: LanguageSetting;
  haptics: boolean;
  defaultPreset: PresetId;
  defaultAspect: Aspect;
};

export const DEFAULT_PREFERENCES: Preferences = {
  themeMode: 'system',
  language: 'system',
  haptics: true,
  defaultPreset: '1080p',
  defaultAspect: '9:16',
};
