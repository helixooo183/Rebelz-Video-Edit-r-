# Rebel Cut — kalite kapısı kontrol listesi

Otomatik doğrulama: `npm run typecheck` (TypeScript 6, hata yok) ve
`npx expo export --platform web` (SDK 58, derleme başarılı).

> Fiziksel cihaz testi (haptik, sistem picker'ı, iOS geri kaydırma) bu ortamda yapılamaz;
> aşağıdaki maddeler kod ve tasarım denetimiyle işaretlendi, cihazda tekrar test edilmelidir.

Ek doğrulama: statik web derlemesi jsdom üzerinde uçtan uca gezdirildi — karşılama → projeler →
seçim → editör (kırp/böl/sırala/sil) → dışa aktarma → başarı, ayarlar → yasal, dil (TR/EN),
tema (açık/koyu), yeniden adlandırma, silme, tüm verileri temizleme ve bilinmeyen rota
(`/nope` → "Sayfa bulunamadı"). Konsol hatası yok.

| Kontrol | Durum | Not |
| --- | --- | --- |
| Ad, ikon ve profil kararı kullanıcıdan mı? | ✅ | Ad: Rebel Cut. Profil yok. İkon: kullanıcı yükleyecek; geçici işaret üretildi ve dokümante edildi. |
| Profil fotoğrafı ile ikon karışmış mı? | ✅ | Profil yok; ikon yalnızca marka işareti. |
| Ana eylem başparmak bölgesinde mi? | ✅ | Alt dock CTA'sı; editör/dışa aktarma/başarı alt butonu. |
| Dokunma hedefleri 44/48 altında mı? | ✅ | Minimum 48; sekmeler 52+, aksiyon kutuları 64, kırpma tutamacı görünür 22 ama hedef 44×56. |
| 8'lik ızgara bozulmuş mu? | ✅ | Boşluklar 4/8/12/16/24/32/48/64. Önizleme boyutu ekrana göre hesaplanıyor. |
| 4'ten fazla yazı boyutu var mı? | ✅ | 4 boyut (28/20/15/12) + 11 px yalnızca video üzeri minik rozetlerde; dekoratif katman. |
| Vurgu rengi her yerde bağırmıyor mu? | ✅ | Vurgu yalnızca CTA, seçim, kırpma aralığı ve küçük pill'lerde. |
| Safe area delinmiş mi? | ✅ | Tüm ekranlar `SafeAreaView`; alt çubuklar inset alıyor. |
| iOS/Android geri davranışı doğru mu? | ✅ | Stack + yerel geri hareketi; Android geri tuşu dışa aktarmada iptal onayı açar; modal picker geri kapanır. |
| Yükleniyor, boş, hata, başarı var mı? | ✅ | Projeler (iskelet/boş/hata), seçim (izin/limit/hata), editör (boş/oynatma/süre), dışa aktarma (proje/işlem/iptal), başarı. |
| Metinler seçilen dilde ve gerçek mi? | ✅ | TR + EN sözlükleri; lorem ipsum yok; sayaçlar ve limitler dinamik. |
| Örnek veride gerçek kişi/kart/adres var mı? | ✅ | Demo veri yok; tüm içerik kullanıcı galerisinden. |
| Koyu temada kontrast duruyor mu? | ✅ | Gövde ≥ 4.5:1; örn. `#F5F3FA` / `#0B0A10` = 16.7:1, `#C6B4FF` / `#120E20` = 10.2:1. |
| Liste sanallaştırılmış mı? | ✅ | Projeler `FlatList`; zaman çizelgesi küçük ve yatay `ScrollView` (en fazla 10 klip). |
| İkon 32 px'te anlaşılıyor mu? | ✅ | Sade "R + kesim çizgisi"; 32 px önizlemede okunur, ince çizgi yok. |
| Klavye formu kapatıyor mu? | ✅ | Yeniden adlandırma modalı `KeyboardAvoidingView` + otomatik odak; başka form yok. |
| Web alert / native olmayan modal var mı? | ✅ | Tüm onay ve eylemler RN `Modal`; `Alert` kullanılmadı. |
| Ağ gecikmesi/sonsuz yükleme var mı? | ✅ | Ağ yok; picker ve depolama gerçek; dışa aktarma 6–40 sn arası simülasyon, her zaman biter. |
| Hassas veri (sağlık/finans/çocuk/konum) var mı? | ✅ | Yok; kamera, mikrofon, konum izni istenmez. |
| Prototip olduğu açıkça yazılı mı? | ✅ | Karşılama dışında Ayarlar, dışa aktarma ve başarı ekranlarında pill/uyarı var. |
| Tasarım görselleri kodla tutarlı mı? | ✅ | `docs/visuals/` maketleri aynı token'lardan üretildi; `npm run docs:previews` ile yenilenir. |

## Bilinen kabul edilebilir sınırlar

- Gerçek kodlama yok; başarı ekranı "dosya kaydedilmedi" der.
- Web'de `blob:` medya adresleri sayfa yenilenince geçersiz olabilir; editör hata durumunu gösterir.
- Klip geçişlerinde kısa kare atlaması olabilir (her klip ayrı oynatıcıyla kurulur).
- Küçük resimler web'de yer tutucudur.
- 11 px metin yalnızca video üzeri sayı rozetlerinde kullanılır; gövde metni değildir.

## Yayın öncesi yapılacaklar

1. Gerçek dışa aktarma motoru ve dosya paylaşımı.
2. Paket kimliği, marka varlıkları, gizlilik URL'si.
3. iOS/Android cihazlarda picker, geri hareketi ve haptik testi.
4. Mağaza ekran görüntüleri (gerçek içerikle, kişisel veri olmadan).
5. Erişilebilirlik taraması: VoiceOver ve TalkBack ile uçtan uca akış.
