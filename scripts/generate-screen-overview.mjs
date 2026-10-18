/**
 * docs/visuals/00-genel-bakis.png kontakt sayfasını üretir.
 * Önce `node scripts/generate-screen-previews.mjs` çalışmış olmalıdır.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = process.env.OUT_DIR ?? path.join(ROOT, 'docs', 'visuals');
const FONT_DIR =
  process.env.FONT_DIR ??
  path.join(ROOT, 'node_modules', '@expo-google-fonts', 'inter');
const FONTS = [
  `${FONT_DIR}/400Regular/Inter_400Regular.ttf`,
  `${FONT_DIR}/500Medium/Inter_500Medium.ttf`,
  `${FONT_DIR}/600SemiBold/Inter_600SemiBold.ttf`,
];
const HAVE_FONTS = FONTS.every((file) => fs.existsSync(file));

const items = [
  ['01-karsilama', 'Karşılama', 'Tek ekran, TR/EN anahtarı'],
  ['02-projeler', 'Projeler', 'Liste · boş · hata · iskelet'],
  ['03-editor', 'Editör', 'Önizleme, kesme, sıralama'],
  ['04-disa-aktarma', 'Dışa aktarma', 'Oran, kalite, boyut tahmini'],
  ['05-basari', 'Başarı', 'Özet, paylaşım, projelere dön'],
  ['06-ayarlar-koyu', 'Ayarlar (koyu)', 'Tema, dil, varsayılanlar'],
  ['07-bos-durum', 'Boş proje durumu', 'İlk videoya yönlendirme'],
  ['08-disa-aktarma-ilerleme', 'İlerleme (koyu)', 'Aşama, yüzde, iptal'],
];

const W = 250;
const H = Math.round((W * 1688) / 780);
const GX = 40;
const GY = 34;
const M = 40;
const HEADER = 128;
const LABEL_H = 46;
const cols = 4;
const rows = Math.ceil(items.length / cols);
const width = M * 2 + cols * W + (cols - 1) * GX;
const height = HEADER + rows * (H + LABEL_H) + (rows - 1) * GY + M - 10;

const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

let phones = '';
items.forEach(([file, title, caption], index) => {
  const col = index % cols;
  const row = Math.floor(index / cols);
  const x = M + col * (W + GX);
  const y = HEADER + row * (H + LABEL_H + GY);
  const b64 = fs.readFileSync(path.join(DIR, `${file}.png`)).toString('base64');
  phones += `<g>
    <clipPath id="c${index}"><rect x="${x}" y="${y}" width="${W}" height="${H}" rx="20"/></clipPath>
    <g clip-path="url(#c${index})">
      <image x="${x}" y="${y}" width="${W}" height="${H}" href="data:image/png;base64,${b64}"/>
    </g>
    <rect x="${x + 0.5}" y="${y + 0.5}" width="${W - 1}" height="${H - 1}" rx="20" fill="none" stroke="#DCD7E8"/>
    <text x="${x + 2}" y="${y + H + 24}" font-family="Inter" font-size="14" font-weight="600" fill="#121018">${esc(title)}</text>
    <text x="${x + 2}" y="${y + H + 41}" font-family="Inter" font-size="11.5" fill="#645E73">${esc(caption)}</text>
  </g>`;
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#FAF9FC"/>
  <g>
    <rect x="${M}" y="34" width="30" height="30" rx="9" fill="#5B34E8"/>
    <text x="${M + 15}" y="${34 + 21}" font-family="Inter" font-size="15" font-weight="600" fill="#FFFFFF" text-anchor="middle">R</text>
    <text x="${M + 42}" y="56" font-family="Inter" font-size="17" font-weight="600" fill="#121018">Rebel Cut — ekranlar</text>
    <text x="${M}" y="94" font-family="Inter" font-size="13" fill="#514B60">Sekiz ekran, aynı tasarım token'ları: 4 punto, 8 pt ızgara, tek vurgu rengi. Açık + koyu tema.</text>
    <text x="${width - M}" y="94" font-family="Inter" font-size="12" fill="#645E73" text-anchor="end">390 × 844 · iOS/Android</text>
  </g>
  ${phones}
</svg>`;

fs.writeFileSync(path.join(DIR, '00-genel-bakis.svg'), svg);
const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: width * 1.4 },
  font: HAVE_FONTS
    ? { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: 'Inter' }
    : { loadSystemFonts: true, defaultFontFamily: 'sans-serif' },
});
const png = resvg.render().asPng();
fs.writeFileSync(path.join(DIR, '00-genel-bakis.png'), png);
console.log('overview', width, height, `${(png.length / 1024).toFixed(0)} KB`);
