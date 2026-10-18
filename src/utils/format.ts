import { Strings } from '@/i18n/strings';

/** 0:07, 1:42, 1:02:03 */
export function formatClock(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? totalSeconds : 0;
  const rounded = Math.round(safe);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${minutes}:${pad(seconds)}`;
}

/** Kısa, insan dilinde süre: "1 dk 12 sn" / "1 min 12 sec" */
export function formatSpokenDuration(totalSeconds: number, t: Strings): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  if (minutes === 0) return `${seconds} ${t.common.seconds}`;
  if (seconds === 0) return `${minutes} ${t.common.minuteShort}`;
  return `${minutes} ${t.common.minuteShort} ${seconds} ${t.common.seconds}`;
}

export function formatBytes(bytes: number, language: 'tr' | 'en'): string {
  const mb = bytes / (1024 * 1024);
  const value = mb >= 100 ? Math.round(mb) : Math.round(mb * 10) / 10;
  const formatted = new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: mb >= 100 ? 0 : 1,
  }).format(value);
  return `${formatted} MB`;
}

export function formatRelativeTime(
  timestamp: number,
  t: Strings,
  now: number = Date.now()
): string {
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 60) return t.projects.timeNow;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return t.projects.timeMinutes(minutes);
  const hours = Math.round(minutes / 60);
  if (hours < 24) return t.projects.timeHours(hours);
  const days = Math.round(hours / 24);
  return t.projects.timeDays(days);
}

export function formatPercent(value: number): string {
  return `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`;
}

/** Kullanıcı adını dosya adına çevirir; boşsa yerelleştirilmiş "render" kullanılır. */
export function slugifyFileName(name: string, fallback = 'rebel-cut'): string {
  const base = name
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || fallback;
}
