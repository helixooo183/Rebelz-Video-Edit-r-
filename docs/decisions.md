# Rebel Cut — kilitlenen kararlar ve varsayımlar

## Onaylanan özet (15 satır)

1. **Ad:** Rebel Cut · kısa ad: RebelCut.
2. **Slogan:** "Sosyal medya için hızlı, temiz video."
3. **Platform:** iOS + Android, Expo + TypeScript; telefon öncelikli, yatayda çalışır.
4. **Tema:** açık + koyu, sisteme uyumlu; vurgu elektrik moru.
5. **Kullanıcı:** 18–34 sosyal medya üreticisi; sorun yavaş/kalite kaybettiren dışa aktarma.
6. **MVP:** kes · birleştir · dışa aktar.
7. **Çıktı:** 720p / 1080p / 1080p 60; 9:16 / 1:1 / 16:9.
8. **Gezinme:** Projeler · Ayarlar sekmeleri + alt dock "Yeni video" CTA'sı.
9. **Akış:** tek karşılama → projeler → seçim → editör → dışa aktarma → başarı.
10. **Hesap/profil yok;** onboarding tek ekran; çevrimdışı, ücretsiz, filigransız.
11. **Kapsam dışı:** sosyal akış, sohbet, ödeme, harita, kamera kaydı, push, yönetici paneli.
12. **Görsel dil:** sistem fontu, tek ikon ailesi (Material Icons), sakin hiyerarşi.
13. **Hareket:** 160–200 ms, hafif; kısa haptik geri bildirim.
14. **Dil/metin:** TR + EN anahtarı; kurumsal ve net ton; gizlilik + koşullar.
15. **Teknik:** Expo Router, yerel depolama, gerçek kodlama yok; dışa aktarma simülasyonu.

## Varsayımlar (kullanıcı "sen karar ver" dedi)

- Backend yok; tüm veriler `AsyncStorage`'da, medya cihazda.
- Demo klip/örnek proje yok; ilk açılış gerçek boş durum.
- Profil ve hesap yok; "verileri temizle" hesap silme yerine geçer.
- İkon kullanıcı tarafından yüklenecek; o gelene kadar geçici "R + kesim" işareti kullanılır.
- Tablet için ayrı düzen yok; geniş ekranda içerik 720 px kolonda ve 2 sütunda.
- Kırpma 0,1 sn adımlı; bölme her iki tarafta 0,5 sn ister.
- Proje başına en fazla 10 klip ve toplam 180 sn.
- Başarı paylaşımı yalnızca metin; dosya üretilmez.

## Bilinçli yapılmayanlar

Sosyal akış, sohbet, ödeme/abonelik, harita, kamera kaydı, push bildirim, yönetici paneli,
hesap/profil, müzik kitaplığı, metin/filtre/geçiş katmanları, gerçek video kodlama,
bulut senkronu, analitik.

## Kullanıcının sonradan değiştirebileceği 5 karar

1. **Vurgu rengi.** Şu an elektrik moru (`#5B34E8` dolgu). Tüm ekranlar token kullanır;
   `src/theme/tokens.ts` içindeki `accent*` ve `accentWash` değerlerini değiştirmek yeterlidir.
2. **Alt gezinme ve CTA.** İki sekme + belirgin "Yeni video" butonu. Üç sekmeye çıkmak
   veya CTA'yı yüzen butona taşımak yalnızca `BottomDock` ve `(tabs)/_layout` dosyalarını etkiler.
3. **Limitler.** 10 klip / 180 sn / 0,5 sn minimum değerleri `theme/tokens.ts`
   içindeki `durationLimits` sabitinde; değiştirilirse seçim ve editör otomatik uyar.
4. **Varsayılan çıktı.** Varsayılan 1080p ve 9:16; Ayarlar'dan değiştirilebilir.
   İlk kurulumda farklı bir varsayılan için `DEFAULT_PREFERENCES` güncellenir.
5. **Karşılama derinliği.** Tek ekran. Daha fazla eğitim istenirse `app/index.tsx`
   yerine 3 adımlı bir carousel eklenebilir; onboarding bayrağı akışı hazır.

## Sonraki sürüm için öneri sırası

1. Gerçek dışa aktarma motoru (native composition veya FFmpeg) + dosya paylaşımı.
2. Kalıcı medya kopyalama (uygulama belgeler dizini) ve proje taşınabilirliği.
3. Metin katmanı ve otomatik altyazı; sosyal medya üreticisi için en yüksek değer.
4. Müzik kitaplığı ve ses seviyesi.
5. Filtreler ve geçişler; ancak performans bütçesi korunarak.
