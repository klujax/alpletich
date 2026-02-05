# Alperen Spor - Fitness Coaching Platform

Modern, dinamik ve kullanıcı dostu bir fitness koçluk platformu.

## 🚀 Özellikler

### Koç Paneli
- **Branşlar:** Özel spor kategorileri oluşturma (Basketbol, Futbol, Yoga vb.)
- **Paketler:** Satılabilir eğitim paketleri oluşturma ve yönetme
- **Öğrenciler:** Kayıtlı öğrencileri görüntüleme ve yönetme
- **Mesajlar:** Öğrencilerle anlık mesajlaşma
- **Beslenme:** Öğrencilere beslenme planları atama
- **Egzersizler:** Egzersiz kütüphanesi ve antrenman planları
- **Ayarlar:** Profil düzenleme ve yeni hoca ekleme

### Öğrenci Paneli
- **Dashboard:** Kişiselleştirilmiş panel
- **Antrenman:** Haftalık antrenman programı
- **Koçumla Sohbet:** Koç ile mesajlaşma (paket özelliğine bağlı)
- **Beslenme:** Atanan beslenme planları
- **Gelişim:** İlerleme takibi ve fotoğraf yükleme

## 🛠️ Teknolojiler

- **Frontend:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **State:** React Hooks + LocalStorage (mock mode)
- **Icons:** Lucide React
- **Notifications:** Sonner

## 📦 Kurulum

### 1. Bağımlılıkları yükleyin
```bash
npm install
```

### 2. Environment değişkenlerini ayarlayın
```bash
# .env.local.example dosyasını kopyalayın
cp .env.local.example .env.local

# Supabase bilgilerinizi girin
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Veritabanını oluşturun
Supabase SQL Editor'de `supabase/migrations/001_schema.sql` dosyasını çalıştırın.

### 4. Uygulamayı başlatın
```bash
npm run dev
```

## 🔧 Modlar

### Mock Modu (Geliştirme)
Supabase yapılandırılmadığında uygulama otomatik olarak mock modunda çalışır. Tüm veriler localStorage'da tutulur.

**Demo Hesapları:**
- Koç: `koc@test.com` / `123456`
- Öğrenci: `ogrenci@test.com` / `123456`

### Production Modu
`.env.local` dosyasına Supabase bilgilerini ekledikten ve migration'ı çalıştırdıktan sonra gerçek veritabanı kullanılır.

## 📁 Proje Yapısı

```
src/
├── app/
│   ├── (auth)/          # Login, Register sayfaları
│   ├── (dashboard)/     # Ana uygulama
│   │   ├── coach/       # Koç paneli sayfaları
│   │   └── student/     # Öğrenci paneli sayfaları
│   └── page.tsx         # Landing page
├── components/
│   └── ui/              # Yeniden kullanılabilir UI bileşenleri
├── lib/
│   ├── api.ts           # Backend abstraction layer
│   ├── mock-service.ts  # Mock data ve servisler
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Utility fonksiyonlar
├── types/
│   └── database.ts      # TypeScript tipleri
└── supabase/
    └── migrations/      # SQL migration dosyaları
```

## 🎨 Tasarım Özellikleri

- Modern glassmorphism efektleri
- Dinamik animasyonlar
- Responsive tasarım
- Dark/Light mode desteği (yakında)
- Özelleştirilebilir tema renkleri

## 📝 TODO

- [ ] Push notifications
- [ ] Video görüşme entegrasyonu
- [ ] Ödeme sistemi (Stripe/iyzico)
- [ ] Mobil uygulama (React Native)
- [ ] Analytics dashboard
- [ ] E-posta bildirimleri

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.
