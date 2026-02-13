# Alperen Spor - Restructure Plan

## Vizyon
- Koçlar → Dükkan açar, ders/program satar, grup açar, online ders verir, mesaj atar
- Öğrenciler → Kayıt olur, branşa göre ders/paket satın alır, antrenman listesi, sohbet, hoca değerlendirir
- Admin → Her şeyi yönetir, ban atar, dükkan kapatır, gelir/gider takibi

## Güncellenecek Dosyalar

### 1. Mock Service (mock-service.ts)
- Dükkan modeli güncelle → paketler dükkan altında
- Grup dersi modeli ekle
- Değerlendirme/rating sistemi ekle
- Satın alma geçmişi/sipariş modeli
- Dükkan kapatma/ban sistemi

### 2. Sidebar (sidebar.tsx)
- Koç: Panel, Dükkanım, Paketlerim, Gruplarım, Öğrenciler, Mesajlar
- Öğrenci: Panel, Pazaryeri, Derslerim, Antrenman, Mesajlar, Koçlarım
- Admin: Sistem, Kullanıcılar, Dükkanlar, Gelirler, Raporlar

### 3. Koç Sayfaları
- Koç Dashboard → dükkan özeti, satış, aktif gruplar
- Dükkan sayfası → paket/program yönetimi
- Grup yönetimi → online ders planla
- Öğrenciler → kayıtlı öğrenciler

### 4. Öğrenci Sayfaları
- Öğrenci Panel → aktif dersler, antrenman
- Pazaryeri → branşa göre dükkan/ders keşfet
- Derslerim → satın alınan paketler
- Koçlarım → hoca değerlendirme

### 5. Admin Sayfaları
- Zaten güzel, iyileştirmeler yap
