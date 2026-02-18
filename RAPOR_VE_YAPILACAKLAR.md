# 📋 SPORTALY — Uygulama İnceleme Raporu & Yapılacaklar Listesi

**Tarih:** 2026-02-18  
**Proje:** Sportaly — Fitness Koçluk Platformu  
**Teknoloji:** Next.js 15 + React 18 + Supabase + Tailwind CSS v4

---

## 📊 GENEL DURUM ÖZETİ

| Alan | Durum | Açıklama |
|------|-------|----------|
| **Derleme (Dev)** | ✅ Çalışıyor | `npm run dev` sorunsuz çalışıyor |
| **Production Build** | ❌ Başarısız | ESLint config hatası + 404 prerender hatası |
| **Kimlik Doğrulama** | ⚠️ Kısmen | Kayıt/giriş çalışıyor ama kritik sorunlar var |
| **Supabase Entegrasyonu** | ⚠️ Hibrit | Mock service + Supabase karışık kullanılıyor |
| **RLS Politikaları** | ⚠️ Eksik | Birçok tabloda RLS tanımsız |
| **Veritabanı Şeması** | ⚠️ Tutarsız | SQL şema ile TypeScript tipleri uyumsuz |
| **UI/UX** | ✅ İyi | Modern ve şık tasarım ama iyileştirmeler gerekli |
| **Mobil Uyumluluk** | ✅ İyi | Mobile-first tasarım, PWA manifest mevcut |
| **Testler** | ❌ Yok | Test altyapısı kurulu ama test yazılmamış |

---

## 🔴 KRİTİK HATALAR (Hemen Düzeltilmeli)

### 1. Production Build Başarısız
- **Sorun:** ESLint config (`eslint-config-next/core-web-vitals`) modül bulunamıyor hatası
- **Etki:** Uygulama production'a deploy edilemez
- **Çözüm:** `eslint.config.mjs` dosyasını düzelt veya ESLint config'i sıfırla

### 2. Çift Servis Katmanı Karmaşası (mock-service vs supabase-service)
- **Sorun:** Bazı sayfalar `supabaseAuthService`/`supabaseDataService` kullanırken, bazıları `authService`/`dataService` (mock) kullanıyor
- **Etkilenen Dosyalar:**
  - `student/page.tsx` → supabaseAuthService
  - `student/progress/page.tsx` → supabaseAuthService
  - `student/packages/page.tsx` → supabaseAuthService
  - `student/my-courses/page.tsx` → supabaseAuthService
  - `student/coaches/page.tsx` → supabaseAuthService
  - `student/classes/page.tsx` → supabaseAuthService
  - `coach/workouts/page.tsx` → supabaseAuthService
  - `coach/students/page.tsx` → supabaseAuthService
  - `coach/sports/page.tsx` → supabaseAuthService
  - `coach/shop/page.tsx` → supabaseAuthService
  - `coach/packages/page.tsx` → supabaseAuthService
  - `coach/classes/page.tsx` → supabaseAuthService
  - `profile/page.tsx` → supabaseAuthService
  - `chat/page.tsx` → supabaseAuthService
  - `layout-content.tsx` → authService (mock)
  - `settings/page.tsx` → authService (mock)
- **Etki:** `supabaseAuthService.getUser()` Supabase session yoksa çalışmaz → sonsuz loading
- **Çözüm:** Tek bir tutarlı servis katmanı kullanılmalı

### 3. Veritabanı Şeması Uyumsuzlukları
- **`supabase_schema.sql`** ile **`database.ts`** tipleri arasında farklar:
  - SQL: `gym_stores.coach_id` → TypeScript: `gym_stores.owner_id`
  - SQL: `messages.read` → TypeScript: `messages.is_read`
  - SQL: `messages.timestamp` → TypeScript: `messages.created_at`
  - SQL: `reviews.user_id` → TypeScript: `reviews.student_id`
  - SQL'de eksik tablolar: `group_classes`, `class_enrollments`, `coach_students`, `exercise_categories`, `exercises`, `workout_plans`, `assigned_workouts`, `nutrition_plans`, `meals`, `progress_logs`
- **Etki:** Supabase sorgularından hata dönecek

### 4. RLS Politikaları Eksik
- **profiles** → ✅ RLS var (ama çift SELECT policy tanımlanmış)
- **gym_stores** → ❌ RLS yok
- **sales_packages** → ❌ RLS yok
- **purchases** → ❌ RLS yok
- **messages** → ❌ RLS yok
- **reviews** → ❌ RLS yok
- **Diğer tablolar** → ❌ Tablolar bile oluşturulmamış
- **Etki:** Herkes her veriye erişebilir — **GÜVENLİK AÇIĞI**

---

## 🟠 ÖNEMLİ SORUNLAR (Kısa Vadede Düzeltilmeli)

,
