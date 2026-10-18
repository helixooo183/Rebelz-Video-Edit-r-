/**
 * Ekran önizlemelerini (docs/visuals/*.png) token'lardan üretir.
 *
 * Gereksinimler:
 *   npm i -D @resvg/resvg-js @expo-google-fonts/inter
 *   node scripts/generate-screen-previews.mjs
 *
 * Bu görseller çalışan uygulamanın ekran görüntüsü değil, tasarım token'larından
 * (renk, 4 punto, 8 pt ızgara) üretilen statik maketlerdir. Metinler TR arayüzü
 * yansıtır; Inter, platform sistem fontunun yerine kullanılan bir temsildir.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.env.OUT_DIR ?? path.join(ROOT, 'docs', 'visuals');
const FONT_DIR =
  process.env.FONT_DIR ??
  path.join(ROOT, 'node_modules', '@expo-google-fonts', 'inter');
const FONTS = [
  `${FONT_DIR}/400Regular/Inter_400Regular.ttf`,
  `${FONT_DIR}/500Medium/Inter_500Medium.ttf`,
  `${FONT_DIR}/600SemiBold/Inter_600SemiBold.ttf`,
];
const HAVE_FONTS = FONTS.every((file) => fs.existsSync(file));

const light = {
  bg: '#F6F5F9',
  surface: '#FFFFFF',
  sunken: '#EFEDF6',
  border: '#E4E1EE',
  text: '#121018',
  secondary: '#514B60',
  tertiary: '#645E73',
  accent: '#6C48F5',
  accentFill: '#5B34E8',
  onAccent: '#FFFFFF',
  accentSoft: '#EFEAFF',
  accentBorder: '#D8CDFF',
  success: '#1B6B47',
  successSoft: '#E7F4EC',
  successBorder: '#C4E5D3',
  danger: '#A3251C',
  dangerSoft: '#FDEDEB',
  tabInactive: '#6B6578',
  tabBar: '#FFFFFF',
};

const dark = {
  bg: '#0B0A10',
  surface: '#14121C',
  sunken: '#09080D',
  border: '#2A2637',
  text: '#F5F3FA',
  secondary: '#C2BCCF',
  tertiary: '#A39BB6',
  accent: '#C0AEFF',
  accentFill: '#C6B4FF',
  onAccent: '#120E20',
  accentSoft: '#211C33',
  accentBorder: '#3B3157',
  success: '#8ADBB0',
  successSoft: '#12261B',
  successBorder: '#274735',
  danger: '#FFB4AB',
  dangerSoft: '#2C1615',
  tabInactive: '#9A93AC',
  tabBar: '#121019',
};

const esc = (s) =>
  String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

function text(x, y, value, o = {}) {
  const {
    size = 15,
    weight = 400,
    fill = '#121018',
    anchor = 'start',
    ls = 0,
    opacity = 1,
  } = o;
  return `<text x="${x}" y="${y}" font-family="Inter" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${ls}" opacity="${opacity}">${esc(value)}</text>`;
}

function rect(x, y, w, h, r, fill, extra = '') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
}

function line(x1, y1, x2, y2, color, width = 1) {
  return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
}

const ICONS = {
  back: '<path d="M15 5 8 12l7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2.6"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  cut: '<circle cx="6.8" cy="7.2" r="2.6"/><circle cx="6.8" cy="16.8" r="2.6"/><path d="M9 8.9 20 17M9 15.1 20 7"/>',
  merge: '<path d="M4 7h9M4 12h6M4 17h9"/><path d="M17 8v8M13 12h8"/>',
  download: '<path d="M12 4v10M8 10l4 4 4-4"/><path d="M5 19h14"/>',
  check: '<path d="M5 12.5 10 17 19 7"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  ratio: '<rect x="3.5" y="6" width="17" height="12" rx="2.5"/><path d="M8 9.5h3.5v5H8"/>',
  file: '<path d="M6.5 3.5h7l4 4v13h-11z"/><path d="M13.5 3.5v4h4"/>',
  trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/><path d="M10 11v5M14 11v5"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 2.6 14.6 0 17M12 3.5c-2.6 2.4-2.6 14.6 0 17"/>',
  film: '<rect x="3.5" y="5" width="17" height="14" rx="3"/><path d="M8 5v14M16 5v14M3.5 9.5H8M3.5 14.5H8M16 9.5h4.5M16 14.5h4.5"/>',
  settings:
    '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2.4"/><circle cx="8" cy="17" r="2.4"/>',
  more: '<circle cx="12" cy="5.5" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="18.5" r="1.5" fill="currentColor" stroke="none"/>',
  mute: '<path d="M4 9.5h4l5-4v13l-5-4H4z"/><path d="M16.5 9.5 21 14M21 9.5 16.5 14"/>',
  close: '<path d="M6 6 18 18M18 6 6 18"/>',
  split: '<path d="M12 4v16"/><path d="M7 8 4 12l3 4M17 8l3 4-3 4"/>',
  arrowLeft: '<path d="M19 12H6M11 6l-6 6 6 6"/>',
  chevronLeft: '<path d="M15 5 8 12l7 7"/>',
  chevronRight: '<path d="M9 5l7 7-7 7"/>',
  share: '<circle cx="17.5" cy="6" r="2.8"/><circle cx="6.5" cy="12" r="2.8"/><circle cx="17.5" cy="18" r="2.8"/><path d="M9 10.6 15 7.4M9 13.4l6 3.2"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v6"/><circle cx="12" cy="7.8" r="0.9" fill="currentColor" stroke="none"/>',
  addPhoto: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M4 17.5 9.5 13l4 3.5 2.5-2 4 4"/><path d="M18 3v4M16 5h4"/>',
  arrowRight: '<path d="M5 12h13M13 6l6 6-6 6"/>',
  playCircle: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5 16 12l-6 3.5z" fill="currentColor" stroke="none"/>',
  hd: '<rect x="3.5" y="6.5" width="17" height="11" rx="2.5"/><path d="M7.5 9.5v5M12 9.5v5M7.5 12h4.5M15 9.5v5h1.8a1.2 1.2 0 0 0 1.2-1.2v-2.6a1.2 1.2 0 0 0-1.2-1.2z"/>',
};

function icon(name, x, y, size, color, sw = 1.7, opacity = 1) {
  const body = ICONS[name].replaceAll('currentColor', color);
  return `<g transform="translate(${x} ${y}) scale(${size / 24})" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}">${body}</g>`;
}

function statusBar(c) {
  const ink = c.text;
  return `<g>
    ${text(26, 40, '9:41', { size: 13, weight: 600, fill: ink })}
    <g fill="${ink}" opacity="0.9">
      <rect x="286" y="35" width="3" height="4" rx="1"/>
      <rect x="291" y="32.5" width="3" height="6.5" rx="1"/>
      <rect x="296" y="30" width="3" height="9" rx="1"/>
      <rect x="301" y="27.5" width="3" height="11.5" rx="1"/>
    </g>
    <g stroke="${ink}" stroke-width="1.6" fill="none" opacity="0.9" stroke-linecap="round">
      <path d="M312 39.5a12 12 0 0 1 15 0"/>
      <path d="M315.5 42.4a7 7 0 0 1 8 0"/>
      <circle cx="319.5" cy="45" r="1.1" fill="${ink}" stroke="none"/>
    </g>
    <g opacity="0.9">
      <rect x="336" y="31" width="22" height="11" rx="3.2" fill="none" stroke="${ink}" stroke-width="1.2"/>
      <rect x="338.5" y="33.5" width="15" height="6" rx="1.6" fill="${ink}"/>
      <rect x="359.5" y="34.5" width="2" height="4" rx="1" fill="${ink}"/>
    </g>
    ${rect(128, 831, 134, 5, 2.5, ink, 'opacity="0.24"')}
  </g>`;
}

function headerBrand(c, lang = 'TR') {
  return `<g>
    ${rect(20, 58, 32, 32, 10, c.accentFill)}
    ${text(36, 80, 'R', { size: 16, weight: 600, fill: c.onAccent, anchor: 'middle' })}
    ${text(60, 80, 'RebelCut', { size: 15.5, weight: 600, fill: c.text })}
    ${rect(306, 58, 64, 32, 16, c.surface, `stroke="${c.border}"`)}
    ${icon('globe', 316, 67, 14, c.secondary, 1.6)}
    ${text(337, 79, lang, { size: 12, weight: 600, fill: c.text })}
  </g>`;
}

function videoPreview(x, y, w, h, r) {
  return `<g>
    <defs>
      <linearGradient id="vid${x}${y}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#241640"/>
        <stop offset="0.55" stop-color="#3A2270"/>
        <stop offset="1" stop-color="#1A1230"/>
      </linearGradient>
      <radialGradient id="glow${x}${y}" cx="0.7" cy="0.2" r="0.7">
        <stop offset="0" stop-color="#8A63FF" stop-opacity="0.55"/>
        <stop offset="1" stop-color="#8A63FF" stop-opacity="0"/>
      </radialGradient>
    </defs>
    ${rect(x, y, w, h, r, `url(#vid${x}${y})`)}
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#glow${x}${y})"/>
    <path d="M${x + w * 0.08} ${y + h * 0.78} L${x + w * 0.34} ${y + h * 0.52} L${x + w * 0.5} ${y + h * 0.66} L${x + w * 0.66} ${y + h * 0.46} L${x + w * 0.92} ${y + h * 0.78}" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="2" fill="none"/>
    <circle cx="${x + w * 0.72}" cy="${y + h * 0.24}" r="${Math.min(w, h) * 0.11}" fill="#F2C6FF" opacity="0.18"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="#FFFFFF" stroke-opacity="0.14"/>
  </g>`;
}

function playButton(cx, cy, r, opacity = 0.94) {
  return `<g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#08060E" fill-opacity="0.62"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#FFFFFF" stroke-opacity="0.28"/>
    <path d="M${cx - r * 0.22} ${cy - r * 0.4} L${cx + r * 0.44} ${cy} L${cx - r * 0.22} ${cy + r * 0.4} Z" fill="#FFFFFF" opacity="${opacity}"/>
  </g>`;
}

function primaryButton(x, y, w, h, label, c, iconName) {
  const textWidth = label.length * 8.1;
  const total = iconName ? textWidth + 26 : textWidth;
  const startX = x + w / 2 - total / 2;
  const g = iconName ? icon(iconName, startX - 1, y + h / 2 - 9, 18, c.onAccent, 2) : '';
  const tx = iconName ? startX + 26 : x + w / 2;
  return `<g>
    ${rect(x, y, w, h, 16, c.accentFill)}
    ${g}
    ${text(tx, y + h / 2 + 5.5, label, {
      size: 15,
      weight: 600,
      fill: c.onAccent,
      anchor: iconName ? 'start' : 'middle',
    })}
  </g>`;
}

function outlineButton(x, y, w, h, label, c) {
  return `<g>
    ${rect(x, y, w, h, 16, c.surface, `stroke="${c.border}"`)}
    ${text(x + w / 2, y + h / 2 + 5.5, label, { size: 15, weight: 600, fill: c.text, anchor: 'middle' })}
  </g>`;
}

function chip(x, y, label, c, tone = 'neutral') {
  const bg = tone === 'success' ? c.successSoft : c.sunken;
  const fg = tone === 'success' ? c.success : c.secondary;
  const stroke = tone === 'success' ? c.successBorder : c.border;
  const w = Math.max(38, label.length * 5.6 + 14);
  return `<g>
    ${rect(x, y, w, 20, 10, bg, `stroke="${stroke}"`)}
    ${text(x + w / 2, y + 13.5, label, { size: 10.5, weight: 500, fill: fg, anchor: 'middle' })}
  </g>`;
}

function sectionLabel(x, y, label, c) {
  return text(x, y, label.toUpperCase(), {
    size: 10.5,
    weight: 600,
    fill: c.tertiary,
    ls: 1.1,
  });
}

function shell(body, c, { square = false } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="780" height="1688" viewBox="0 0 390 844">
    ${rect(0, 0, 390, 844, square ? 0 : 0, c.bg)}
    ${body}
  </svg>`;
}

/* ------------------------------------------------------------------ */
/* 01 — Karşılama                                                      */
/* ------------------------------------------------------------------ */
const welcome = (() => {
  const c = light;
  const feature = (y, name, title, body) => `<g>
    ${rect(20, y, 36, 36, 12, c.accentSoft)}
    ${icon(name, 28, y + 8, 20, c.accent, 1.8)}
    ${text(70, y + 15, title, { size: 15, weight: 600, fill: c.text })}
    ${text(70, y + 32, body, { size: 12, fill: c.tertiary })}
  </g>`;

  return shell(
    `<g>
      ${statusBar(c)}
      ${headerBrand(c)}
      ${text(20, 138, 'SOSYAL MEDYA İÇİN VİDEO DÜZENLEME', {
        size: 10,
        weight: 600,
        fill: c.accent,
        ls: 0.9,
      })}
      ${text(20, 176, 'Kes, birleştir,', { size: 28, weight: 600, fill: c.text })}
      ${text(20, 210, 'dışa aktar.', { size: 28, weight: 600, fill: c.text })}
      ${text(20, 244, 'Fazlalık olmadan.', { size: 28, weight: 600, fill: c.text })}
      ${text(20, 272, 'Klipleri seçin, başlangıç ve bitişi belirleyin,', { size: 14, fill: c.secondary })}
      ${text(20, 293, 'sıraya koyun ve dışa aktarın.', { size: 14, fill: c.secondary })}
      ${text(20, 314, 'Hesap yok, akış yok, gürültü yok.', { size: 14, fill: c.secondary })}

      <g>
        <defs>
          <linearGradient id="welcomeCard" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#241640"/>
            <stop offset="1" stop-color="#41228C"/>
          </linearGradient>
        </defs>
        ${rect(20, 334, 350, 156, 20, 'url(#welcomeCard)')}
        ${rect(20, 334, 350, 156, 20, 'none', 'stroke="#FFFFFF" stroke-opacity="0.16"')}
        ${rect(35, 351, 18, 6, 3, c.accentFill)}
        ${rect(57, 351, 6, 6, 3, '#FFFFFF', 'opacity="0.42"')}
        ${rect(67, 351, 6, 6, 3, '#FFFFFF', 'opacity="0.42"')}
        ${playButton(195, 408, 27)}
        ${rect(35, 451, 320, 26, 6, '#FFFFFF', 'opacity="0.12"')}
        ${rect(158, 466, 60, 26, 5, '#FFFFFF', 'opacity="0.18"')}
        ${rect(224, 466, 26, 26, 5, '#FFFFFF', 'opacity="0.18"')}
        ${rect(256, 466, 74, 26, 5, '#FFFFFF', 'opacity="0.18"')}
        ${rect(35, 481, 320, 3, 2, '#FFFFFF', 'opacity="0.18"')}
        ${rect(35, 481, 108, 3, 2, c.accentFill)}
      </g>

      ${feature(510, 'cut', 'Kes', 'Başlangıç ve bitişi tam olarak belirleyin.')}
      ${feature(562, 'merge', 'Birleştir', 'Tüm klipleri tek zaman çizelgesinde sıralayın.')}
      ${feature(614, 'download', 'Dışa aktar', '720p, 1080p veya 1080p 60.')}

      <g>
        ${icon('lock', 20, 676, 14, c.tertiary, 1.7)}
        ${text(40, 687, 'Klipler bu cihazda kalır.', { size: 12, fill: c.tertiary })}
      </g>

      ${primaryButton(20, 710, 350, 52, 'Video seç', c, 'plus')}
      ${text(195, 790, 'Projelere git', { size: 14, weight: 600, fill: c.accent, anchor: 'middle' })}
    </g>`,
    c
  );
})();

/* ------------------------------------------------------------------ */
/* 02 — Projeler                                                       */
/* ------------------------------------------------------------------ */
const projectCard = (x, y, w, c, { title, meta, badge, badgeTone, thumbLabel }) => `<g>
  ${rect(x, y, w, 96, 16, c.surface, `stroke="${c.border}"`)}
  <g>
    <defs>
      <linearGradient id="thumb${title.length}${y}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2A1A4A"/>
        <stop offset="1" stop-color="#5A34B8"/>
      </linearGradient>
    </defs>
    ${rect(x + 12, y + 12, 64, 72, 12, `url(#thumb${title.length}${y})`)}
    <path d="M${x + 37} ${y + 40} L${x + 52} ${y + 48} L${x + 37} ${y + 56} Z" fill="#FFFFFF" opacity="0.9"/>
    ${text(x + 44, y + 76, thumbLabel, { size: 9, weight: 500, fill: '#FFFFFF', anchor: 'middle', opacity: 0.8 })}
  </g>
  ${text(x + 92, y + 34, title, { size: 15, weight: 600, fill: c.text })}
  ${text(x + 92, y + 53, meta, { size: 12, fill: c.tertiary })}
  ${chip(x + 92, y + 63, badge, c, badgeTone)}
  ${text(x + 92 + Math.max(38, badge.length * 5.6 + 14) + 8, y + 77, 'az önce', { size: 11, fill: c.tertiary })}
  ${icon('more', x + 302, y + 18, 18, c.tertiary, 1.7)}
</g>`;

const projects = (() => {
  const c = light;
  return shell(
    `<g>
      ${statusBar(c)}
      ${text(20, 106, 'Projeler', { size: 28, weight: 600, fill: c.text })}
      ${icon('lock', 20, 116, 14, c.tertiary, 1.7)}
      ${text(40, 127, 'Klipleriniz bu cihazda kalır.', { size: 12, fill: c.tertiary })}

      ${projectCard(20, 154, 350, c, {
        title: 'Hafta sonu',
        meta: '2 klip · 0:14',
        badge: 'Dışa aktarıldı',
        badgeTone: 'success',
        thumbLabel: '0:14',
      })}
      ${projectCard(20, 262, 350, c, {
        title: 'Ürün tanıtımı',
        meta: '1 klip · 0:08',
        badge: 'Taslak',
        badgeTone: 'neutral',
        thumbLabel: '0:08',
      })}

      ${rect(20, 386, 350, 44, 12, c.sunken)}
      ${icon('film', 34, 400, 16, c.tertiary, 1.7)}
      ${text(58, 413, 'Projeler cihazda saklanır. Uygulama silinirse kaldırılır.', { size: 11.5, fill: c.tertiary })}

      <g>
        ${rect(0, 770, 390, 74, 0, c.tabBar)}
        ${line(0, 770, 390, 770, c.tabBarBorder, 1)}
        ${rect(38, 778, 24, 3, 2, c.accentFill)}
        ${icon('film', 44, 786, 22, c.accent, 1.8)}
        ${text(56, 827, 'Projeler', { size: 11, weight: 600, fill: c.accent, anchor: 'middle' })}
        ${icon('settings', 109, 786, 22, c.tabInactive, 1.8)}
        ${text(121, 827, 'Ayarlar', { size: 11, fill: c.tabInactive, anchor: 'middle' })}
        ${rect(216, 786, 154, 48, 24, c.accentFill)}
        ${icon('plus', 232, 800, 18, c.onAccent, 2)}
        ${text(254, 816, 'Yeni video', { size: 13.5, weight: 600, fill: c.onAccent })}
      </g>
    </g>`,
    c
  );
})();

/* ------------------------------------------------------------------ */
/* 03 — Editör (koyu)                                                  */
/* ------------------------------------------------------------------ */
const editor = (() => {
  const c = dark;
  const actionTile = (x, y, w, name, label, active = false) => `<g>
    ${rect(x, y, w, 46, 12, active ? c.accentSoft : c.surface, `stroke="${active ? c.accentBorder : c.border}"`)}
    ${icon(name, x + w / 2 - 9, y + 8, 17, active ? c.accent : c.secondary, 1.7)}
    ${text(x + w / 2, y + 40, label, { size: 10, weight: 500, fill: active ? c.accent : c.secondary, anchor: 'middle' })}
  </g>`;

  return shell(
    `<g>
      ${statusBar(c)}
      ${icon('back', 30, 68, 20, c.text, 1.9)}
      ${text(72, 82, 'Hafta sonu', { size: 17, weight: 600, fill: c.text })}
      ${text(72, 100, '2 klip · 0:14', { size: 11, fill: c.tertiary })}
      ${rect(320, 64, 40, 40, 12, c.surface, `stroke="${c.border}"`)}
      ${icon('plus', 330, 74, 20, c.text, 1.9)}

      ${videoPreview(116, 120, 158, 280, 16)}
      ${rect(128, 132, 40, 22, 11, '#08060E', 'opacity="0.62"')}
      ${text(148, 147, '1 / 2', { size: 10, weight: 600, fill: '#FFFFFF', anchor: 'middle' })}
      ${rect(238, 132, 26, 26, 13, '#08060E', 'opacity="0.62"')}
      ${icon('mute', 243, 137, 16, '#FFFFFF', 1.6)}
      ${playButton(195, 252, 24)}
      ${text(128, 380, '0:00 / 0:08', { size: 10, weight: 500, fill: '#FFFFFF', opacity: 0.85 })}
      ${rect(128, 386, 134, 3, 2, '#FFFFFF', 'opacity="0.24"')}
      ${rect(128, 386, 42, 3, 2, c.accentFill)}

      <g>
        ${rect(20, 414, 84, 54, 10, c.sunken, `stroke="${c.accentFill}" stroke-width="1.6"`)}
        <defs>
          <linearGradient id="tl1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#2A1A4A"/>
            <stop offset="1" stop-color="#5A34B8"/>
          </linearGradient>
        </defs>
        ${rect(23, 417, 78, 48, 8, 'url(#tl1)')}
        ${text(62, 461, '0:08', { size: 9, weight: 600, fill: '#FFFFFF', anchor: 'middle' })}
        ${rect(112, 414, 84, 54, 10, c.surface, `stroke="${c.border}"`)}
        ${rect(115, 417, 78, 48, 8, '#3A2A5E')}
        ${text(154, 461, '0:06', { size: 9, weight: 600, fill: '#FFFFFF', anchor: 'middle' })}
        ${rect(204, 414, 46, 54, 10, c.surface, `stroke="${c.border}" stroke-dasharray="3 4"`)}
        ${icon('plus', 217, 429, 20, c.secondary, 1.8)}
        ${text(227, 484, 'Klip ekle', { size: 10, fill: c.tertiary, anchor: 'middle' })}
        ${text(62, 490, '0:08', { size: 10, fill: c.tertiary, anchor: 'middle' })}
        ${text(154, 490, '0:06', { size: 10, fill: c.tertiary, anchor: 'middle' })}
      </g>

      <g>
        ${rect(20, 508, 350, 216, 16, c.surface, `stroke="${c.border}"`)}
        ${text(36, 534, 'Kırpma', { size: 13, weight: 600, fill: c.text })}
        ${text(354, 534, 'Klip 1 / 2 · 0:08', { size: 10, fill: c.tertiary, anchor: 'end' })}
        ${text(36, 556, 'Başlangıç', { size: 10.5, fill: c.tertiary })}
        ${text(354, 556, 'Bitiş', { size: 10.5, fill: c.tertiary, anchor: 'end' })}
        ${text(36, 578, '0:00', { size: 13, weight: 600, fill: c.text })}
        ${text(354, 578, '0:08', { size: 13, weight: 600, fill: c.text, anchor: 'end' })}
        ${rect(36, 594, 318, 6, 3, c.sunken)}
        ${rect(72, 594, 246, 6, 3, c.accentFill, 'opacity="0.42"')}
        ${rect(66, 585, 8, 24, 4, c.accentFill)}
        ${rect(314, 585, 8, 24, 4, c.accentFill)}

        ${actionTile(36, 622, 100, 'chevronLeft', 'Sola taşı')}
        ${actionTile(145, 622, 100, 'cut', 'Bu noktadan böl', true)}
        ${actionTile(254, 622, 100, 'chevronRight', 'Sağa taşı')}

        ${text(36, 685, 'Oynatıcıyı klibin içine getirin, sonra bölün.', { size: 10, fill: c.tertiary })}
        ${icon('trash', 36, 694, 15, c.danger, 1.7)}
        ${text(57, 706, 'Klibi sil', { size: 11.5, weight: 600, fill: c.danger })}
      </g>

      ${text(195, 748, 'Değişiklikler otomatik kaydedilir.', { size: 10, fill: c.tertiary, anchor: 'middle' })}
      ${line(0, 762, 390, 762, c.border, 1)}
      ${primaryButton(20, 774, 350, 52, 'Dışa aktar', c, 'download')}
    </g>`,
    c
  );
})();

/* ------------------------------------------------------------------ */
/* 04 — Dışa aktarma (ayarlar)                                         */
/* ------------------------------------------------------------------ */
const segmented = (x, y, w, c, options, activeIndex, { withHint = false } = {}) => {
  const h = withHint ? 58 : 46;
  const inner = w - 8;
  const seg = inner / options.length;
  let out = `<g>${rect(x, y, w, h, 16, c.sunken, `stroke="${c.border}"`)}`;
  options.forEach((label, index) => {
    const sx = x + 4 + seg * index;
    const selected = index === activeIndex;
    if (selected) {
      out += rect(sx + 2, y + 4, seg - 4, h - 8, 12, c.surface, `stroke="${c.accentBorder}"`);
    }
    if (withHint) {
      out += text(sx + seg / 2, y + 25, label[0], {
        size: 12,
        weight: selected ? 600 : 400,
        fill: selected ? c.text : c.secondary,
        anchor: 'middle',
      });
      out += text(sx + seg / 2, y + 42, label[1], { size: 10, fill: c.tertiary, anchor: 'middle' });
    } else {
      out += text(sx + seg / 2, y + 28, label, {
        size: 12,
        weight: selected ? 600 : 400,
        fill: selected ? c.text : c.secondary,
        anchor: 'middle',
      });
    }
  });
  return `${out}</g>`;
};

const exportScreen = (() => {
  const c = light;
  const row = (x, y, w, name, label, value) => `<g>
    ${icon(name, x, y - 13, 18, c.accent, 1.7)}
    ${text(x, y + 16, label, { size: 10.5, fill: c.tertiary })}
    ${text(x, y + 36, value, { size: 15, weight: 600, fill: c.text })}
  </g>`;

  return shell(
    `<g>
      ${statusBar(c)}
      ${icon('back', 30, 68, 20, c.text, 1.9)}
      ${text(72, 80, 'Dışa aktar', { size: 15, weight: 600, fill: c.text })}
      ${text(72, 97, 'Hafta sonu', { size: 11, fill: c.tertiary })}
      ${chip(286, 68, 'Prototip', c)}
      ${rect(286, 68, 84, 24, 12, c.accentSoft, `stroke="${c.accentBorder}"`)}
      ${text(328, 84, 'Prototip', { size: 10.5, weight: 600, fill: c.accent, anchor: 'middle' })}

      ${text(20, 136, 'Dışa aktar', { size: 28, weight: 600, fill: c.text })}
      ${text(20, 158, 'Ayarları seçin ve dosyayı oluşturun.', { size: 14, fill: c.secondary })}

      ${sectionLabel(20, 194, 'Oran', c)}
      ${segmented(20, 204, 350, c, ['9:16 · Dikey', '1:1 · Kare', '16:9 · Yatay'], 0)}

      ${sectionLabel(20, 280, 'Kalite', c)}
      ${segmented(
        20,
        290,
        350,
        c,
        [
          ['720p', 'Hızlı'],
          ['1080p', 'Dengeli'],
          ['1080p 60', 'Akıcı'],
        ],
        1,
        { withHint: true }
      )}

      ${sectionLabel(20, 384, 'Tahmini çıktı', c)}
      <g>
        ${rect(20, 394, 350, 92, 16, c.surface, `stroke="${c.border}"`)}
        ${row(40, 420, 100, 'clock', 'Süre', '0:14')}
        ${line(150, 404, 150, 476, c.border, 1)}
        ${row(172, 420, 100, 'film', 'Klip', '2')}
        ${line(258, 404, 258, 476, c.border, 1)}
        ${row(280, 420, 90, 'file', 'Dosya boyutu', '~16,7 MB')}
      </g>

      <g>
        ${rect(20, 502, 350, 62, 12, c.surface, `stroke="${c.border}"`)}
        ${icon('lock', 34, 518, 16, c.tertiary, 1.7)}
        ${text(56, 526, 'Bu prototipte dışa aktarma simüle edilir;', { size: 11, fill: c.tertiary })}
        ${text(56, 542, 'cihaza dosya yazılmaz.', { size: 11, fill: c.tertiary })}
      </g>

      ${primaryButton(20, 596, 350, 52, 'Dışa aktarmayı başlat', c, 'download')}
      ${text(195, 672, '1080p · 9:16 · 30 sn tahmini süre', { size: 11, fill: c.tertiary, anchor: 'middle' })}
    </g>`,
    c
  );
})();

/* ------------------------------------------------------------------ */
/* 05 — Başarı                                                         */
/* ------------------------------------------------------------------ */
const success = (() => {
  const c = light;
  const summaryRow = (y, name, label, value) => `<g>
    ${icon(name, 36, y - 1, 17, c.secondary, 1.7)}
    ${text(62, y + 13, label, { size: 13, fill: c.secondary })}
    ${text(354, y + 13, value, { size: 13, weight: 600, fill: c.text, anchor: 'end' })}
  </g>`;

  return shell(
    `<g>
      ${statusBar(c)}
      ${rect(20, 62, 40, 40, 12, c.surface, `stroke="${c.border}"`)}
      ${icon('close', 30, 72, 20, c.text, 1.9)}
      ${rect(286, 70, 84, 24, 12, c.accentSoft, `stroke="${c.accentBorder}"`)}
      ${text(328, 86, 'Prototip', { size: 10.5, weight: 600, fill: c.accent, anchor: 'middle' })}

      <g>
        ${rect(155, 126, 80, 80, 40, c.successSoft, `stroke="${c.successBorder}"`)}
        ${icon('check', 179, 150, 32, c.success, 2.4)}
      </g>
      ${text(195, 244, 'Dışa aktarma', { size: 28, weight: 600, fill: c.text, anchor: 'middle' })}
      ${text(195, 278, 'tamamlandı', { size: 28, weight: 600, fill: c.text, anchor: 'middle' })}
      ${text(195, 306, 'Videonuz seçilen ayarlarla hazırlandı.', { size: 14, fill: c.secondary, anchor: 'middle' })}

      <g>
        ${rect(20, 334, 350, 204, 18, c.surface, `stroke="${c.border}"`)}
        ${sectionLabel(36, 362, 'Çıktı özeti', c)}
        ${summaryRow(378, 'ratio', 'Oran', '9:16 · Dikey')}
        ${line(36, 404, 354, 404, c.border, 1)}
        ${summaryRow(414, 'hd', 'Kalite', '1080p')}
        ${line(36, 440, 354, 440, c.border, 1)}
        ${summaryRow(450, 'clock', 'Süre', '0:14')}
        ${line(36, 476, 354, 476, c.border, 1)}
        ${summaryRow(486, 'file', 'Dosya boyutu', '16,7 MB')}
      </g>

      <g>
        ${rect(20, 554, 350, 82, 12, '#FFF4D6', 'stroke="#F0DCA4"')}
        ${icon('info', 34, 570, 16, '#7A5200', 1.7)}
        ${text(56, 581, 'Prototip: cihaza dosya kaydedilmedi.', { size: 11, fill: '#7A5200' })}
        ${text(56, 599, 'Gerçek video kodlama sonraki sürümde', { size: 11, fill: '#7A5200' })}
        ${text(56, 617, 'eklenecek.', { size: 11, fill: '#7A5200' })}
      </g>

      ${primaryButton(20, 660, 350, 52, 'Paylaş', c, 'share')}
      ${outlineButton(20, 722, 350, 52, 'Projelere dön', c)}
      ${text(195, 802, 'Düzenlemeye devam et', { size: 13, weight: 600, fill: c.accent, anchor: 'middle' })}
    </g>`,
    c
  );
})();

/* ------------------------------------------------------------------ */
/* 06 — Ayarlar (koyu)                                                 */
/* ------------------------------------------------------------------ */
const settings = (() => {
  const c = dark;
  const switchEl = (x, y, on) => `<g>
    ${rect(x, y, 46, 28, 14, on ? c.accentFill : c.sunken, `stroke="${on ? c.accentFill : c.border}"`)}
    <circle cx="${on ? x + 32 : x + 14}" cy="${y + 14}" r="10" fill="${on ? c.onAccent : c.tertiary}"/>
  </g>`;

  return shell(
    `<g>
      ${statusBar(c)}
      ${text(20, 106, 'Ayarlar', { size: 28, weight: 600, fill: c.text })}
      ${icon('lock', 20, 116, 14, c.tertiary, 1.7)}
      ${text(40, 127, 'Hesap yok. Videolar cihazda kalır.', { size: 12, fill: c.tertiary })}

      ${sectionLabel(20, 158, 'Genel', c)}
      <g>
        ${rect(20, 168, 350, 252, 16, c.surface, `stroke="${c.border}"`)}
        ${text(36, 194, 'Görünüm', { size: 13, weight: 600, fill: c.text })}
        ${text(36, 210, 'Cihaz temasını izler veya sabitlenir.', { size: 10.5, fill: c.tertiary })}
        ${segmented(36, 220, 318, c, ['Sistem', 'Açık', 'Koyu'], 2)}
        ${line(36, 284, 354, 284, c.border, 1)}
        ${text(36, 310, 'Dil', { size: 13, weight: 600, fill: c.text })}
        ${segmented(36, 320, 318, c, ['Sistem', 'Türkçe', 'İngilizce'], 1)}
        ${line(36, 382, 354, 382, c.border, 1)}
        ${text(36, 405, 'Dokunma geri bildirimi', { size: 13, weight: 600, fill: c.text })}
        ${switchEl(308, 390, true)}
      </g>

      ${sectionLabel(20, 452, 'Çıktı', c)}
      <g>
        ${rect(20, 462, 350, 142, 16, c.surface, `stroke="${c.border}"`)}
        ${text(36, 488, 'Kalite', { size: 12, weight: 600, fill: c.text })}
        ${segmented(
          36,
          498,
          318,
          c,
          [
            ['720p', 'Hızlı'],
            ['1080p', 'Dengeli'],
            ['1080p 60', 'Akıcı'],
          ],
          1,
          { withHint: true }
        )}
        ${line(36, 568, 354, 568, c.border, 1)}
        ${text(36, 592, 'Oran', { size: 12, weight: 600, fill: c.text })}
        ${text(354, 592, '9:16', { size: 12, weight: 600, fill: c.text, anchor: 'end' })}
      </g>

      ${sectionLabel(20, 634, 'Yasal', c)}
      <g>
        ${rect(20, 644, 350, 100, 16, c.surface, `stroke="${c.border}"`)}
        ${text(36, 670, 'Gizlilik politikası', { size: 12, fill: c.text })}
        ${text(354, 670, '›', { size: 16, fill: c.tertiary, anchor: 'end' })}
        ${line(36, 688, 354, 688, c.border, 1)}
        ${text(36, 715, 'Kullanım koşulları', { size: 12, fill: c.text })}
        ${text(354, 715, '›', { size: 16, fill: c.tertiary, anchor: 'end' })}
      </g>

      <g>
        ${rect(0, 770, 390, 74, 0, c.tabBar)}
        ${line(0, 770, 390, 770, c.tabBarBorder, 1)}
        ${icon('film', 44, 786, 22, c.tabInactive, 1.8)}
        ${text(56, 827, 'Projeler', { size: 11, fill: c.tabInactive, anchor: 'middle' })}
        ${rect(97, 778, 24, 3, 2, c.accentFill)}
        ${icon('settings', 109, 786, 22, c.accent, 1.8)}
        ${text(121, 827, 'Ayarlar', { size: 11, weight: 600, fill: c.accent, anchor: 'middle' })}
        ${rect(216, 786, 154, 48, 24, c.accentFill)}
        ${icon('plus', 232, 800, 18, c.onAccent, 2)}
        ${text(254, 816, 'Yeni video', { size: 13.5, weight: 600, fill: c.onAccent })}
      </g>
    </g>`,
    c
  );
})();

/* ------------------------------------------------------------------ */
/* 07 — Boş durum (açık)                                               */
/* ------------------------------------------------------------------ */
const emptyProjects = (() => {
  const c = light;
  return shell(
    `<g>
      ${statusBar(c)}
      ${text(20, 106, 'Projeler', { size: 28, weight: 600, fill: c.text })}
      ${icon('lock', 20, 116, 14, c.tertiary, 1.7)}
      ${text(40, 127, 'Klipleriniz bu cihazda kalır.', { size: 12, fill: c.tertiary })}

      <g>
        ${rect(167, 322, 56, 56, 28, c.accentSoft, `stroke="${c.accentBorder}"`)}
        ${icon('film', 182, 337, 26, c.accent, 1.7)}
      </g>

      ${text(195, 420, 'Henüz proje yok', { size: 20, weight: 600, fill: c.text, anchor: 'middle' })}
      ${text(195, 448, 'İlk videonuz için galerinizden', { size: 14, fill: c.secondary, anchor: 'middle' })}
      ${text(195, 468, 'birkaç klip seçin.', { size: 14, fill: c.secondary, anchor: 'middle' })}
      ${text(195, 492, 'En fazla 10 klip · 3 dakika', { size: 12, fill: c.tertiary, anchor: 'middle' })}

      ${primaryButton(85, 520, 220, 52, 'Video seç', c, 'addPhoto')}

      <g>
        ${rect(0, 770, 390, 74, 0, c.tabBar)}
        ${line(0, 770, 390, 770, c.tabBarBorder, 1)}
        ${rect(38, 778, 24, 3, 2, c.accentFill)}
        ${icon('film', 44, 786, 22, c.accent, 1.8)}
        ${text(56, 827, 'Projeler', { size: 11, weight: 600, fill: c.accent, anchor: 'middle' })}
        ${icon('settings', 109, 786, 22, c.tabInactive, 1.8)}
        ${text(121, 827, 'Ayarlar', { size: 11, fill: c.tabInactive, anchor: 'middle' })}
        ${rect(216, 786, 154, 48, 24, c.accentFill)}
        ${icon('plus', 232, 800, 18, c.onAccent, 2)}
        ${text(254, 816, 'Yeni video', { size: 13.5, weight: 600, fill: c.onAccent })}
      </g>
    </g>`,
    c
  );
})();

/* ------------------------------------------------------------------ */
/* 08 — Dışa aktarma ilerlemesi (koyu)                                 */
/* ------------------------------------------------------------------ */
const progress = (() => {
  const c = dark;
  return shell(
    `<g>
      ${statusBar(c)}
      ${icon('back', 30, 68, 20, c.text, 1.9)}
      ${text(72, 80, 'Dışa aktar', { size: 15, weight: 600, fill: c.text })}
      ${text(72, 97, 'Hafta sonu', { size: 11, fill: c.tertiary })}
      ${rect(286, 70, 84, 24, 12, c.accentSoft, `stroke="${c.accentBorder}"`)}
      ${text(328, 86, 'Prototip', { size: 10.5, weight: 600, fill: c.accent, anchor: 'middle' })}

      <g>
        ${rect(159, 210, 72, 72, 36, c.accentSoft, `stroke="${c.accentBorder}"`)}
        ${icon('download', 183, 234, 32, c.accent, 1.9)}
      </g>

      ${text(195, 340, '62%', { size: 28, weight: 600, fill: c.text, anchor: 'middle' })}
      ${text(195, 368, 'Kareler işleniyor', { size: 14, fill: c.secondary, anchor: 'middle' })}

      <g>
        ${rect(20, 410, 350, 8, 4, c.sunken, `stroke="${c.border}"`)}
        ${rect(20, 410, 217, 8, 4, c.accentFill)}
        ${text(20, 440, '0:14 · Kalite 1080p', { size: 10.5, fill: c.tertiary })}
        ${text(370, 440, 'Yaklaşık 11 sn kaldı', { size: 10.5, fill: c.tertiary, anchor: 'end' })}
      </g>

      <g>
        ${rect(20, 476, 350, 62, 12, c.surface, `stroke="${c.border}"`)}
        ${icon('lock', 34, 492, 16, c.tertiary, 1.7)}
        ${text(56, 500, 'Bu prototipte dışa aktarma simüle edilir;', { size: 11, fill: c.tertiary })}
        ${text(56, 516, 'cihaza dosya yazılmaz.', { size: 11, fill: c.tertiary })}
      </g>

      ${text(195, 758, 'İptal', { size: 15, weight: 600, fill: c.danger, anchor: 'middle' })}
    </g>`,
    c
  );
})();

const screens = [
  ['01-karsilama', welcome],
  ['02-projeler', projects],
  ['03-editor', editor],
  ['04-disa-aktarma', exportScreen],
  ['05-basari', success],
  ['06-ayarlar-koyu', settings],
  ['07-bos-durum', emptyProjects],
  ['08-disa-aktarma-ilerleme', progress],
];

fs.mkdirSync(OUT, { recursive: true });

for (const [name, svg] of screens) {
  fs.writeFileSync(path.join(OUT, `${name}.svg`), svg);
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 780 },
    font: HAVE_FONTS
      ? { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: 'Inter' }
      : { loadSystemFonts: true, defaultFontFamily: 'sans-serif' },
  });
  const png = resvg.render().asPng();
  fs.writeFileSync(path.join(OUT, `${name}.png`), png);
  console.log(name, `${(png.length / 1024).toFixed(0)} KB`);
}
