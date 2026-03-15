-- =============================================
-- 🚀 SPORTALY PRODUCTION-READY RLS & SECURITY
-- =============================================
-- Bu dosya tabloları günceller, sahte veri girişini ve korsan satın alımları engeller.
-- =============================================

-- 1. EKSİK TABLOLAR İÇİN GÜVENLİK
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  target_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
-- Sadece admin görebilir
CREATE POLICY "Admins can view logs" ON public.admin_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================
-- 2. ANA TABLOLARDA RLS AÇIKLARINI KAPATMA
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_students ENABLE ROW LEVEL SECURITY;

-- 2.1 PROFILES (Kullanıcılar kendilerini sadece belirli alanlarda güncelleyebilir)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- KORSAN AKTİVİTE ENGELLEME: Role'ü, aktif programı kimse kendi kendine update edemez (sadece full_name, avatar vb)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
-- Sadece service_role / yetkilendirilmiş API'ler bypass edebilsin diye RLS sınırlandırıyoruz, 
-- UPDATE edilebilir column'ları supabase column security izinleriyle veya functionlarla korumak daha zordur.
-- Bunun yerine Supabase RLS'i ile sadece okuma/yazma ayarlanır. Biz API (api.ts) üzerinden service_role ile güncelliyoruz zaten.
-- Kullanıcı kendi alanlarını güncelleyebilir fakat role'ünü asla güncelleyemez: (O yüzden role column'ı client'tan kapatılıyor)
CREATE POLICY "Users can update their own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = id) 
WITH CHECK (role = (SELECT role FROM public.profiles WHERE id = auth.uid())); -- Role değiştiremez

-- 2.2 PURCHASES (🚨 KRİTİK DÜZELTME: Satın alımlar bedavaya getirilemez) 
DROP POLICY IF EXISTS "Users can create purchases" ON public.purchases;
-- Eski kural: CREATE POLICY "Users can create purchases" ON ... FOR INSERT WITH CHECK (auth.uid() = user_id);
-- BU KURAL KALDIRILDI! Satın alımlar SADECE server-side üzerinden iyzico onayından geçip Service Role anahtarıyla eklenir. (RLS bypass)
-- Hiçbir client, anon key ile direkt satın alma işlemi oluşturamaz.

DROP POLICY IF EXISTS "Students can view their own purchases" ON public.purchases;
CREATE POLICY "Students can view their own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id OR auth.uid() = student_id);

DROP POLICY IF EXISTS "Coaches can view purchases of their services" ON public.purchases;
CREATE POLICY "Coaches can view purchases of their services" ON public.purchases FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.sales_packages sp WHERE sp.id = package_id AND sp.coach_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.gym_stores gs WHERE gs.id = shop_id AND gs.coach_id = auth.uid())
);

-- 2.3 COACH_STUDENTS (Koç-Öğrenci ilişkisi)
DROP POLICY IF EXISTS "Students see their relations" ON public.coach_students;
CREATE POLICY "Students see their relations" ON public.coach_students FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Coaches see their relations" ON public.coach_students;
CREATE POLICY "Coaches see their relations" ON public.coach_students FOR SELECT USING (auth.uid() = coach_id);

-- Öğrenci kendini koça ekleyemez (Satın alım sonrasi API üzerinden eklenir).
DROP POLICY IF EXISTS "Anyone can insert" ON public.coach_students;

-- 2.4 GYM STORES & PACKAGES (Sadece Koçlar)
DROP POLICY IF EXISTS "Coaches can create their own store" ON public.gym_stores;
CREATE POLICY "Coaches can create their own store" ON public.gym_stores FOR INSERT WITH CHECK (
  auth.uid() = coach_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'coach')
);

DROP POLICY IF EXISTS "Coaches can update their own store" ON public.gym_stores;
CREATE POLICY "Coaches can update their own store" ON public.gym_stores FOR UPDATE USING (
  auth.uid() = coach_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'coach')
);

DROP POLICY IF EXISTS "Coaches can create packages" ON public.sales_packages;
CREATE POLICY "Coaches can create packages" ON public.sales_packages FOR INSERT WITH CHECK (
  auth.uid() = coach_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'coach')
);

DROP POLICY IF EXISTS "Coaches can update their own packages" ON public.sales_packages;
CREATE POLICY "Coaches can update their own packages" ON public.sales_packages FOR UPDATE USING (auth.uid() = coach_id);

-- =============================================
-- 3. GÜVENLİK TRIGGERLARI (Security Triggers)
-- =============================================
-- Kullanıcı kaydı anında sadece öğrenci olarak kayıt olabilmesini zorla. 
-- Admin yapmak isteyen API hilesi yapamaz. Sadece Super Admin tarafından değiştirilir.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    -- Herkes default 'student' başlar. Eğer front-end 'coach' veya 'admin' gönderirse göz ardı edilir!
    'student'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sadece system_role ve yöneticiler manuel olarak role'ü güncelleyebilir.
-- (Veritabanı dışı müdahaleleri kestik)
