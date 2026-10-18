# Rebel Cut — ekran haritası

> Görsel karşılıklar: [`docs/visuals/00-genel-bakis.png`](visuals/00-genel-bakis.png)
> (tüm ekranlar) ve numaralı tek tek görseller. Maketler aynı token'lardan üretilir.

## Akış

```text
İlk açılış
  └─ /  Karşılama
       ├─ "Video seç" ─────────────► /projects ─► /select (modal)
       │                                   └─ seçim yoksa geri döner
       └─ "Projelere git" ─────────► /projects

Projeler ─► kart ─► /editor/[id]
                 ├─ "+" ─► /select?projectId=… ─► geri (klipler eklenir)
                 ├─ "Dışa aktar" ─► /export/[id] ─► /success/[id]
                 └─ geri ─► sekmeler

Ayarlar ─► yasal sayfalar (/legal/privacy, /legal/terms)
        └─ "Tüm verileri temizle" ─► onay ─► /

Not: İlk proje oluşturulunca /select yerine /editor açılır; altında sekmeler kalır.
Başarı ekranı dışa aktarma ekranının yerini alır; "geri" editöre döner.
```

## 1. Karşılama — `/`

- **Amaç:** Ürünü 15 saniyede anlat; ilk kesime giden tek yol.
- **İçerik:** Marka satırı, dil anahtarı (TR/EN), başlık, açıklama, ürün önizleme kartı
  (oynatma + zaman çizelgesi motifi), 3 özellik (kes/birleştir/dışa aktar), cihazda kalma notu.
- **Ana eylem:** "Video seç" → sekmeler açılır ve galeri seçimi başlar.
- **İkincil:** "Projelere git" (karşılamayı atla).
- **Durumlar:** onboarding durumu okunurken boş zemin; dönüşte doğrudan sekmelere yönlendirme.
- **Erişilebilirlik:** Başlık `header`, dil düğmesi 44+ hedef, özellik listesi tek grup.

## 2. Projeler — `/projects`

- **Amaç:** Cihazdaki projeleri göster; yeni video başlat.
- **İçerik:** Başlık + yerel veri notu, proje kartları (ilk klip karesi, ad, klip/süre,
  durum rozeti, göreli zaman), alt dock (Projeler · Ayarlar · Yeni video).
- **Ana eylem:** Karta dokun → editör; alt dock "Yeni video" → seçim.
- **Durumlar:**
  - Yükleniyor: 3 iskelet kart.
  - Boş: "Henüz proje yok" + limit özeti + "Video seç".
  - Hata: "Projeler okunamadı" + "Tekrar dene" (yeniden okuma).
  - Dolu: 1 sütun; ≥720 px'te 2 sütun.
- **Menü:** Yeniden adlandır (modal + 60 karakter sayacı), projeyi sil (onay diyaloğu).
- **Erişilebilirlik:** Kart etiketi başlık + meta + zaman; menü düğmesi ayrı 44 hedef.

## 3. Klip seç — `/select` (modal)

- **Amaç:** Galeriden video seç; limitleri önceden anlat.
- **Mod:** Yeni proje veya `?projectId=` ile mevcut projeye ekleme.
- **İçerik:** Kapat, seçim sayacı, başlık/açıklama, toplam süre göstergesi,
  3 bilgi satırı (10 klip · 3 dk · cihazda), CTA + vazgeç.
- **Ana eylem:** "Galeriden seç" → sistem picker.
- **Durumlar:**
  - İzin yok: gerekçe + "Ayarları aç".
  - Seçim yok: sessiz kal (picker iptal).
  - Çok klip: "En fazla 10 klip" uyarısı, ekleme yapılmaz.
  - Süre aşımı: 3 dakika uyarısı, ekleme yapılmaz.
  - Desteklenmeyen dosya: hata + "Tekrar seç".
  - İşleniyor: "Klipler hazırlanıyor…" bloğu.
  - Ekleyen proje varsa kalan klip sayısı gösterilir; CTA sınırda pasif.
- **Not:** Süre gelmezse video süresi cihazda yoklanır (web: `<video>`; native: kısa ömürlü player).

## 4. Editör — `/editor/[id]`

- **Amaç:** Kırp, böl, sırala ve önizle; dışa aktarmaya hazırla.
- **Yapı:** Başlık (proje adı, klip/süre) + geri + "klip ekle"; video önizleme
  (oranına göre boyutlanır, oynatma/duraklat, sessize al, süre, ilerleme);
  zaman çizelgesi; kırpma kartı; otomatik kayıt notu; alt CTA "Dışa aktar".
- **Ana eylem:** "Dışa aktar" (klipler geçerliyse).
- **Kırpma:** Başlangıç/bitiş tutamaçları 0,1 sn adım; kırpılan süre başlıkta.
- **Aksiyonlar:** Sola taşı, bu noktadan böl (min 0,5 sn her iki taraf), sağa taşı,
  klibi sil (onay). Bölme sonucu kısa onay satırı.
- **Durumlar:**
  - Klip yok: boş durum + "Klip ekle".
  - Süre okunamadı: uyarı + klibi kaldır; dışa aktarma kapalı.
  - Oynatma hatası: önizlemede kart + "Klibi kaldır".
  - Yatay: önizleme solda, kontroller sağda; alt CTA tam genişlik.
  - Otomatik kayıt: her değişiklik 300 ms içinde yerel depoya yazılır.
- **Erişilebilirlik:** Zaman çizelgesi blokları "Klip n, süre, seç" etiketli;
  kırpma tutamaçları adjustable; aksiyonlar 64 pt kutular ve görünür etiketli.

## 5. Dışa aktarma — `/export/[id]`

- **Amaç:** Oran ve kalite seç; prototip işlemini çalıştır.
- **İçerik:** Oran (9:16 / 1:1 / 16:9), kalite (720p / 1080p / 1080p 60 + kısa ipucu),
  tahmini çıktı (süre, klip, dosya boyutu), prototip notu, alt CTA.
- **İşlem ekranı:** büyük yüzde, aşama (hazırlık → kareler → ses → dosya → bitiş),
  ilerleme çubuğu, kalan süre, iptal.
- **Durumlar:**
  - Proje yok: hata + projelere dön.
  - Geçersiz klip/süre yok: düzenlemeye dön çağrısı.
  - İptal: onay diyaloğu; devam ederse ayarlara döner, proje taslak kalır.
  - Tamamlanma: proje `exported`, son çıktı özeti kaydedilir, başarı ekranı açılır.
  - Android geri tuşu işlem sırasında iptal onayını açar.
- **Gerçeklik notu:** İlerleme simülasyondur; dosya yazılmaz.

## 6. Başarı — `/success/[id]`

- **Amaç:** Zirve anı; ne üretildiğini özetle, paylaş veya devam et.
- **İçerik:** Onay ikonu, başlık, kısa gövde, çıktı özeti (oran, kalite, süre, boyut),
  prototip uyarısı; "Paylaş", "Projelere dön", "Düzenlemeye devam et".
- **Paylaşım:** Metin paylaşımı (`Share`); dosya yok. Kullanılamazsa sarı bilgi satırı.
- **Durumlar:** Özet yoksa hata + projelere dön. Kapat → projeler.
- **Erişilebilirlik:** Canlı duyuru yok; başlık `header`, özet satırları okunur metin.

## 7. Ayarlar — `/(tabs)/settings`

- **Bölümler:**
  - Genel: tema (Sistem/Açık/Koyu), dil (Sistem/Türkçe/İngilizce), haptik anahtarı.
  - Çıktı: varsayılan kalite ve oran.
  - Yasal: gizlilik, koşullar.
  - Veriler: tüm verileri temizle (onay) → karşılamaya dön.
  - Hakkında: marka, sürüm, prototip pill'i, cihazda kalma notu.
- **Durumlar:** Depolama okunamazsa kırmızı uyarı; temizleme sonrası onboarding sıfırlanır.
- **Erişilebilirlik:** Segmentler radyo; anahtar `switch`; satırlar 56 pt.

## 8. Yasal — `/legal/privacy` / `/legal/terms`

- **Amaç:** Yerel veri işleme ve prototip koşullarını açıkça yaz.
- **İçerik:** Güncelleme tarihi, giriş, 5 başlık; geri dönüş.
- **Durumlar:** Bilinmeyen belge → hata durumu + geri.
- **Not:** Hesap olmadığı için "hesap silme" sayfası yok; "tüm verileri temizle" fiili karşılığı.

## Durum matrisi (özet)

| Ekran | Yükleniyor | Boş | Hata | Başarı | İzin |
| --- | --- | --- | --- | --- | --- |
| Projeler | iskelet | + CTA | + tekrar dene | — | — |
| Klip seç | hazırlanıyor | picker iptal | + tekrar seç | seçim → editör | + ayarlar |
| Editör | — | + CTA | oynatma/süre | bölme onayı | — |
| Dışa aktarma | yüzde/aşama | — | proje/klip | başarı ekranı | — |
| Başarı | — | — | özet yok | özet + paylaş | — |
| Ayarlar | — | — | depolama uyarısı | temizleme → / | — |
