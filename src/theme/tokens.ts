import { Platform, TextStyle } from 'react-native';

/**
 * Rebel Cut tasarım token'ları.
 * Tek kaynak: ekranlarda ham hex, ham punto veya rastgele boşluk kullanılmaz.
 * Renkler 60 / 30 / 10 kuralına göre: %60 nötr zemin, %30 metin/yapı, %10 tek vurgu.
 */

export type ColorScheme = 'light' | 'dark';

export type ThemeColors = {
  bg: string;
  bgSubtle: string;
  surface: string;
  surfaceRaised: string;
  surfaceSunken: string;
  border: string;
  borderStrong: string;

  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  /** Video/koyu medya üzerindeki metin ve ikonlar; iki temada da beyaz kalır. */
  onMedia: string;

  accent: string;
  accentFill: string;
  accentFillPressed: string;
  onAccent: string;
  accentSoft: string;
  accentBorder: string;
  /** Kırpma aralığı gibi yarı saydam vurgu dolguları. */
  accentWash: string;

  danger: string;
  dangerFill: string;
  onDanger: string;
  dangerSoft: string;
  dangerBorder: string;

  success: string;
  successSoft: string;
  successBorder: string;

  warning: string;
  warningSoft: string;
  warningBorder: string;

  videoBg: string;
  /** Video/medya üzerindeki kontrol ve katmanlar; iki temada da aynı. */
  mediaControl: string;
  mediaControlStrong: string;
  mediaShade: string;
  mediaShadeSoft: string;
  mediaTint: string;
  mediaBorder: string;
  mediaTrack: string;
  overlay: string;
  scrim: string;
  skeleton: string;
  skeletonHighlight: string;

  tabBar: string;
  tabBarBorder: string;
  tabActive: string;
  tabInactive: string;

  inputBg: string;
  focus: string;
};

export type Theme = {
  scheme: ColorScheme;
  colors: ThemeColors;
  shadow: {
    floating: {
      shadowColor: string;
      shadowOpacity: number;
      shadowRadius: number;
      shadowOffset: { width: number; height: number };
      elevation: number;
    };
    card: {
      shadowColor: string;
      shadowOpacity: number;
      shadowRadius: number;
      shadowOffset: { width: number; height: number };
      elevation: number;
    };
  };
  statusBarStyle: 'light' | 'dark';
};

const light: Theme = {
  scheme: 'light',
  colors: {
    bg: '#F6F5F9',
    bgSubtle: '#EFEDF6',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    surfaceSunken: '#EFEDF6',
    border: '#E4E1EE',
    borderStrong: '#CFC9DF',

    text: '#121018',
    textSecondary: '#514B60',
    textTertiary: '#645E73',
    textInverse: '#FFFFFF',
    onMedia: '#FFFFFF',

    accent: '#6C48F5',
    accentFill: '#5B34E8',
    accentFillPressed: '#4A26C9',
    onAccent: '#FFFFFF',
    accentSoft: '#EFEAFF',
    accentBorder: '#D8CDFF',
    accentWash: 'rgba(91, 52, 232, 0.12)',

    danger: '#A3251C',
    dangerFill: '#B3261E',
    onDanger: '#FFFFFF',
    dangerSoft: '#FDEDEB',
    dangerBorder: '#F3C9C5',

    success: '#1B6B47',
    successSoft: '#E7F4EC',
    successBorder: '#C4E5D3',

    warning: '#7A5200',
    warningSoft: '#FFF4D6',
    warningBorder: '#F0DCA4',

    videoBg: '#0A0810',
    mediaControl: 'rgba(8, 6, 14, 0.62)',
    mediaControlStrong: 'rgba(8, 6, 14, 0.76)',
    mediaShade: 'rgba(8, 6, 14, 0.36)',
    mediaShadeSoft: 'rgba(8, 6, 14, 0.18)',
    mediaTint: 'rgba(255, 255, 255, 0.14)',
    mediaBorder: 'rgba(255, 255, 255, 0.24)',
    mediaTrack: 'rgba(255, 255, 255, 0.18)',
    overlay: 'rgba(10, 8, 16, 0.55)',
    scrim: 'rgba(10, 8, 16, 0.78)',
    skeleton: '#E7E3F0',
    skeletonHighlight: '#F3F1F8',

    tabBar: '#FFFFFF',
    tabBarBorder: '#E4E1EE',
    tabActive: '#5B34E8',
    tabInactive: '#6B6578',

    inputBg: '#FFFFFF',
    focus: '#5B34E8',
  },
  shadow: {
    floating: {
      shadowColor: '#2B1A5C',
      shadowOpacity: 0.22,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    card: {
      shadowColor: '#2B1A5C',
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
  },
  statusBarStyle: 'dark',
};

const dark: Theme = {
  scheme: 'dark',
  colors: {
    bg: '#0B0A10',
    bgSubtle: '#0F0D16',
    surface: '#14121C',
    surfaceRaised: '#1A1723',
    surfaceSunken: '#09080D',
    border: '#2A2637',
    borderStrong: '#3C3650',

    text: '#F5F3FA',
    textSecondary: '#C2BCCF',
    textTertiary: '#A39BB6',
    textInverse: '#0B0A10',
    onMedia: '#FFFFFF',

    accent: '#C0AEFF',
    accentFill: '#C6B4FF',
    accentFillPressed: '#B29DF7',
    onAccent: '#120E20',
    accentSoft: '#211C33',
    accentBorder: '#3B3157',
    accentWash: 'rgba(198, 180, 255, 0.16)',

    danger: '#FFB4AB',
    dangerFill: '#FFB4AB',
    onDanger: '#3B0A08',
    dangerSoft: '#2C1615',
    dangerBorder: '#5A2E2A',

    success: '#8ADBB0',
    successSoft: '#12261B',
    successBorder: '#274735',

    warning: '#E9C46A',
    warningSoft: '#2A2113',
    warningBorder: '#514321',

    videoBg: '#050409',
    mediaControl: 'rgba(8, 6, 14, 0.62)',
    mediaControlStrong: 'rgba(8, 6, 14, 0.76)',
    mediaShade: 'rgba(8, 6, 14, 0.36)',
    mediaShadeSoft: 'rgba(8, 6, 14, 0.18)',
    mediaTint: 'rgba(255, 255, 255, 0.14)',
    mediaBorder: 'rgba(255, 255, 255, 0.24)',
    mediaTrack: 'rgba(255, 255, 255, 0.18)',
    overlay: 'rgba(5, 4, 9, 0.55)',
    scrim: 'rgba(5, 4, 9, 0.82)',
    skeleton: '#201C2B',
    skeletonHighlight: '#2A2538',

    tabBar: '#121019',
    tabBarBorder: '#262232',
    tabActive: '#C6B4FF',
    tabInactive: '#9A93AC',

    inputBg: '#191623',
    focus: '#C6B4FF',
  },
  shadow: {
    floating: {
      shadowColor: '#05040A',
      shadowOpacity: 0.55,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 10 },
      elevation: 10,
    },
    card: {
      shadowColor: '#05040A',
      shadowOpacity: 0.35,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
  },
  statusBarStyle: 'light',
};

export const themes: Record<ColorScheme, Theme> = { light, dark };

/** RN 0.88'de StyleSheet.absoluteFillObject tipi kaldırıldı; tek yerden tanımlanır. */
export const absoluteFill = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
} as const;

/** 4 ve 8'in katları. */
export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const layout = {
  screenPadding: 20,
  contentMaxWidth: 720,
  tabBarHeight: 58,
  fabHeight: 52,
  iconButton: 44,
  minTarget: 48,
  cardPadding: 16,
  videoAspectPlaceholder: 16 / 9,
} as const;

/** En fazla 4 punto, 2 ağırlık. */
export const type = {
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600',
    letterSpacing: -0.6,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
} as const satisfies Record<string, TextStyle>;

export const weights = {
  regular: '400',
  semibold: '600',
} as const;

export const motion = {
  /** 150–250 ms aralığı; çıkış girişten kısa. */
  enter: 200,
  exit: 160,
  progressTick: 120,
} as const;

/** 8'lik ızgara + safe area. */
export const durationLimits = {
  maxClips: 10,
  maxTotalSeconds: 180,
  minClipSeconds: 0.5,
} as const;

export const exportPresets = {
  '720p': { height: 720, fps: 30, bitrateMbps: 6 },
  '1080p': { height: 1080, fps: 30, bitrateMbps: 10 },
  '1080p60': { height: 1080, fps: 60, bitrateMbps: 16 },
} as const;

export const aspects = ['9:16', '1:1', '16:9'] as const;

/** Video önizleme yüzeyleri için sabit koyu gradyan (medya bağlamı). */
export const mediaGradient = ['#2E2148', '#0A0810'] as const;

export const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
});
