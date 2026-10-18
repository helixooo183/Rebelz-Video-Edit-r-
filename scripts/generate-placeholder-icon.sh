#!/usr/bin/env bash
# Rebel Cut — geçici (placeholder) uygulama ikonu üreteci.
# Kullanıcı kendi ikonunu yükleyince bu dosyaları değiştirmesi yeterlidir.
# Gereksinim: ImageMagick 6 (convert) + DejaVu Sans Bold.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ASSETS="$ROOT/assets"
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
ACCENT="#7C5CFF"
INK="#0B0A10"

mkdir -p "$ASSETS"

# 1024×1024 mağaza ikonu (tam kare; köşe maskesini iOS/Android uygular)
convert -size 1024x1024 gradient:'#2A1D46-#08080D' \
  -font "$FONT" -pointsize 600 -fill '#FFFFFF' -gravity center -annotate +0-40 'R' \
  -stroke "$ACCENT" -strokewidth 72 -fill none \
  -draw "stroke-linecap round line 610,810 890,530" \
  "$ASSETS/icon.png"

# Android adaptive foreground (saydam zemin, güvenli alan içinde)
convert -size 1024x1024 xc:none \
  -font "$FONT" -pointsize 430 -fill '#FFFFFF' -gravity center -annotate +0-20 'R' \
  -stroke "$ACCENT" -strokewidth 52 -fill none \
  -draw "stroke-linecap round line 610,740 830,520" \
  "$ASSETS/adaptive-icon.png"

# Android monochrome (tek renk alfa maskesi)
convert -size 1024x1024 xc:none \
  -font "$FONT" -pointsize 430 -fill '#FFFFFF' -gravity center -annotate +0-20 'R' \
  "$ASSETS/monochrome-icon.png"

# Splash: yuvarlatılmış kare marka karosu (açık/koyu zeminde okunur)
convert -size 512x512 xc:none \
  -fill '#7C5CFF' -draw "roundrectangle 0,0 511,511 116,116" \
  -font "$FONT" -pointsize 300 -fill '#FFFFFF' -gravity center -annotate +0-20 'R' \
  -stroke '#1A1030' -strokewidth 30 -fill none \
  -draw "stroke-linecap round line 310,400 440,270" \
  "$ASSETS/splash-icon.png"

# Web favicon
convert "$ASSETS/splash-icon.png" -resize 64x64 "$ASSETS/favicon.png"

echo "Yazıldı: icon.png, adaptive-icon.png, monochrome-icon.png, splash-icon.png, favicon.png"
