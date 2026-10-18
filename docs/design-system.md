# Rebel Cut — Tasarım sistemi

Tek kaynak: `src/theme/tokens.ts`. Ekranlarda ham renk, rastgele punto veya serbest boşluk kullanılmaz.

## 1. İlkeler

1. **İçerik önde.** Video karesi en büyük görsel öğe; arayüz onun önüne geçmez.
2. **Tek vurgu.** Mor yalnızca ana eylem, seçim ve kırpma aralığı için. Geri kalan nötr.
3. **Hız hissi.** Az katman, net hiyerarşi, kısa geçişler. Her ekranda tek birincil eylem.
4. **Dürüstlük.** Prototip olduğu yerde söylenir; olmayan dosya "kaydedildi" denmez.
5. **Erişilebilirlik sonradan eklenmez.** Hedef ölçüleri, etiketler ve kontrast token seviyesinde.

## 2. Renk

60 / 30 / 10: %60 nötr zemin, %30 metin/yapı, %10 vurgu. Vurgunun yumuşak tonu
(`accentSoft`, `accentWash`) yalnızca ikincil yüzeylerde.

### Açık tema

| Token | Değer | Kullanım |
| --- | --- | --- |
| `bg` | `#F6F5F9` | Ekran zemini |
| `surface` | `#FFFFFF` | Kart, çubuk |
| `surfaceSunken` | `#EFEDF6` | Segment arka planı, iç alan |
| `border` / `borderStrong` | `#E4E1EE` / `#CFC9DF` | Ayırıcı / belirgin kenar |
| `text` | `#121018` | Başlık, gövde |
| `textSecondary` | `#514B60` | İkincil gövde |
| `textTertiary` | `#645E73` | Alt yazı, ipucu |
| `accent` | `#6C48F5` | Vurgu metni/ikonu (bg üzerinde 4.98:1) |
| `accentFill` | `#5B34E8` | Birincil buton dolgusu (beyazla 6.77:1) |
| `accentSoft` / `accentBorder` | `#EFEAFF` / `#D8CDFF` | Vurgulu ikincil yüzey |
| `danger` | `#A3251C` | Yıkıcı metin |
| `success` | `#1B6B47` | Başarı metni |
| `warning` | `#7A5200` | Uyarı metni |
| `videoBg` | `#0A0810` | Video çerçevesi |
| `onMedia` | `#FFFFFF` | Video üzerindeki metin/ikon |

### Koyu tema

| Token | Değer | Not |
| --- | --- | --- |
| `bg` | `#0B0A10` | — |
| `surface` / `surfaceRaised` | `#14121C` / `#1A1723` | Kart / modal |
| `border` / `borderStrong` | `#2A2637` / `#3C3650` | — |
| `text` / `textSecondary` / `textTertiary` | `#F5F3FA` / `#C2BCCF` / `#A39BB6` | — |
| `accent` | `#C0AEFF` | Metin/ikon |
| `accentFill` | `#C6B4FF` | Buton dolgusu, metin `#120E20` (10.25:1) |
| `accentSoft` / `accentBorder` | `#211C33` / `#3B3157` | — |
| `danger` / `warning` / `success` | `#FFB4AB` / `#E9C46A` / `#8ADBB0` | Koyu zeminde okunur |

Video üzeri katmanlar iki temada aynı: `mediaControl` (kontrol zemini),
`mediaControlStrong` (zaman çizelgesi etiketi), `mediaShade` / `mediaShadeSoft`
(karartma), `mediaTint` / `mediaBorder` / `mediaTrack` (dekoratif çizgi ve iz).

**Kural:** kırmızı ve sarı yalnızca hata/uyarı/yıkıcı eylem. Gölgeler siyah değil,
zeminin mor tonundan (`shadow.floating`, `shadow.card`).

## 3. Tipografi

Sistem fontu: iOS SF, Android Roboto/sans-serif, web sistem yığını. Tek aile.

| Rol | Boyut / satır | Ağırlık | Kullanım |
| --- | --- | --- | --- |
| `display` | 28 / 34 | 600 | Ekran başlığı, karşılama başlığı |
| `title` | 20 / 26 | 600 | Bölüm, kart başlığı, diyalog başlığı |
| `body` | 15 / 22 | 400–600 | Gövde, buton, girdi |
| `caption` | 12 / 16 | 400–600 | Etiket, meta, ipucu |

- En fazla 4 boyut, 2 ağırlık (400/600).
- Rakamlar saat/süre gibi yerlerde `numeric` (tabular) ile hizalanır.
- `allowFontScaling` açık; sabit yükseklikli ikon düğmeleri dışında taşma kutusu yok.
- Etiket değerden büyük olmaz: süre büyük, "Toplam" küçük.

## 4. Boşluk ve ızgara

`4, 8, 12, 16, 24, 32, 48, 64`.

- Ekran kenarı: 20 (+ safe area).
- Kart içi: 16; büyük kart 24.
- İlişkili öğeler 8–12, gruplar arası 24.
- Telefon tabanı 390×844; 320 genişlikte taşma yok (segmentler 2 satıra izin verir).
- İçerik genişliği en fazla 720 (web/tablet orta kolon).

## 5. Yarıçap ve yükseklik

| Token | Değer | Kullanım |
| --- | --- | --- |
| `sm` | 8 | Küçük etiket, tutamaç |
| `md` | 12 | Segment, aksiyon kutusu, küçük kart |
| `lg` | 16 | Kart, buton, video çerçevesi |
| `xl` | 22 | Modal, alt sayfa, öne çıkan kart |
| `pill` | 999 | Sekme, pill, ikon düğmesi |

Gölge: `card` çok hafif, `floating` buton/modal. Koyu temada gölge yoğunluğu artar,
siyah yerine `#05040A` mor-siyah.

## 6. Hareket

- Giriş 200 ms, çıkış 160 ms; sadece `opacity` ve `transform`.
- Önizleme oynatma göstergesi ve ilerleme çubuğu 100–150 ms'lik adımlarla güncellenir.
- İskelet nabzı 700 ms; `AccessibilityInfo.isReduceMotionEnabled` ise animasyon durur.
- Liste satırlarında kademeli gecikme yok; konfeti yok.
- Haptik: seçim (hafif), kesim onayı (light impact), başarı (notification success),
  iptal/uyarı (warning). Yalnızca tercih açıksa ve native'de.

## 7. Dokunma ve erişilebilirlik

- Minimum hedef **48×48** (iOS 44, Android 48 gereksinimlerinin üzerinde).
- Komşu hedefler arası en az 8.
- Ana eylem ekranın alt üçte birinde: alt dock CTA'sı, editör/dışa aktarma alt butonu.
- İkon düğmeleri `accessibilityLabel` zorunlu; dekoratif ikonlar gizli.
- Kırpma tutamaçları `adjustable` + `accessibilityValue` + artır/azalt (1 sn).
- Sekmeler `role="tab"` + `selected`; seçim renk dışında üst gösterge ve ağırlıkla da belli.
- Hata/başarı bildirimleri `accessibilityLiveRegion="polite"`.

## 8. Bileşenler

| Bileşen | Davranış |
| --- | --- |
| `Button` | primary / secondary / text / destructive; 48–52 yükseklik; basılınca %88 opaklık |
| `IconButton` | 48 hedef, yuvarlak; overlay varyantı video üzerinde |
| `SegmentedControl` | 2–3 seçenek, 44+ hedef, radyo rolü; seçili durum kenarlık + ağırlık |
| `TrimBar` | çift tutamaç, 0,1 sn adım, 0,5 sn minimum aralık, video karesi zemin |
| `Timeline` | süreyle orantılı bloklar, seçim kenarlığı, aktif klipte oynatma çizgisi |
| `Sheet` | alttan açılan eylem sayfası, 52 satır, yıkıcı eylem kırmızı metin |
| `ConfirmDialog` | native modal, başlık + gövde + yıkıcı onay + vazgeç |
| `EmptyState` / `ErrorState` | ikon, başlık, gövde, tek eylem; hata insan dilinde |
| `PrototypePill` | sarı yumuşak zemin, "Prototip" etiketi |
| `Skeleton` | nabız; azaltılmış harekette sabit |

## 9. Ekran durumları (zorunlu matris)

| Durum | Sunum |
| --- | --- |
| Yükleniyor | İskelet kartlar (projeler), spinner + etiket (picker), yüzde + aşama (export) |
| Boş | Ne olduğu + neden + tek eylem ("Henüz proje yok" → "Video seç") |
| Hata | Kırmızı yumuşak kart, insan dili, "Tekrar dene" |
| Başarı | Onay kartı/sayfa, özet, sonraki adım |
| İzin yok | Galeri gerekçesi + sistem ayarlarına yol |
| Çevrimdışı | Ağ kullanılmadığı için özel ekran yok; tüm işlemler yerel |

## 10. İkon ve görsel dil

- Tek aile: **Material Icons** (`@expo/vector-icons`). Karışık aile yok.
- Profil yok; buna karşılık marka işareti "R" yalnızca karşılama ve ayarlarda.
- Uygulama ikonu: 1024 kaynak, sade "R + kesim çizgisi", güvenli pay, 32 px'te okunur.
- Video küçük resmi native'de gerçek kare; web'de film ikonlu nötr yer tutucu.
- Stok fotoğraf, gerçek yüz, karmaşık kolaj yok.

## 11. Yazı tonu

- Kurumsal ve net; kısa cümle; kullanıcıyı suçlamayan hata metni.
- Butonda fiil: "Video seç", "Dışa aktarmayı başlat", "Projeyi sil".
- Belirsiz "Tamam / Gönder" yok.
- Placeholder etiketin yerine geçmez; alan etiketi her zaman görünür, sayaç gösterilir.
- Türkçe ve İngilizce metinler aynı bilgi yoğunluğunda; İngilizce çeviri sonradan eklenmiş gibi durmaz.

## 12. Yapılmaması gerekenler

- Vurgu rengini geniş yüzeylerde kullanmak (buton dışında büyük bloklar).
- Sabit siyah gölge, 1 px'den kalın dekoratif kenarlıklar.
- Kırmızı dolgulu "Sil" butonu; onay diyaloğu varken ikinci bir kırmızı CTA.
- Sonsuz spinner, her listede konfeti, rastgele ikon boyutları.
- Metni küçültüp sığdırmak; satır kırın veya yapıyı değiştirin.
