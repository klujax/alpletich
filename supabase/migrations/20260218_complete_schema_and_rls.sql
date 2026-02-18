-- =============================================
-- 1. EKSİK TABLOLARIN OLUŞTURULMASI
-- =============================================

-- Group Classes Table
CREATE TABLE IF NOT EXISTS public.group_classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coach_id UUID REFERENCES public.profiles(id) NOT NULL,
  shop_id UUID REFERENCES public.gym_stores(id),
  title TEXT NOT NULL,
  description TEXT,
  sport TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  max_participants INTEGER DEFAULT 20,
  enrolled_participants JSONB DEFAULT '[]'::jsonb, -- Denormalized for quick access, but real relation is class_enrollments
  meeting_link TEXT,
  status TEXT CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')) DEFAULT 'scheduled',
  price NUMERIC DEFAULT 0,
  recurrence TEXT CHECK (recurrence IN ('none', 'weekly', 'monthly')) DEFAULT 'none',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Class Enrollments Table
CREATE TABLE IF NOT EXISTS public.class_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) NOT NULL,
  class_id UUID REFERENCES public.group_classes(id) NOT NULL,
  status TEXT CHECK (status IN ('active', 'cancelled')) DEFAULT 'active',
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, class_id)
);

-- Exercise Categories (Opsiyonel ama iyi yapı için)
CREATE TABLE IF NOT EXISTS public.exercise_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Exercises Library
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  target_muscle TEXT,
  equipment TEXT,
  video_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================
-- 2. MEVCUT TABLOLARIN GÜNCELLENMESİ (Kolon Düzeltmeleri)
-- =============================================

-- =============================================
-- 2. MEVCUT TABLORIN GÜNCELLENMESİ (KOLON KONTROLLERİ)
-- =============================================

-- Purchases tablosuna user_id ve student_id ekle (Eğer yoksa)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'user_id') THEN
        ALTER TABLE public.purchases ADD COLUMN user_id UUID REFERENCES public.profiles(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'student_id') THEN
        ALTER TABLE public.purchases ADD COLUMN student_id UUID REFERENCES public.profiles(id);
    END IF;
    -- Reviews tablosu için
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'user_id') THEN
        ALTER TABLE public.reviews ADD COLUMN user_id UUID REFERENCES public.profiles(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'student_id') THEN
        ALTER TABLE public.reviews ADD COLUMN student_id UUID REFERENCES public.profiles(id);
    END IF;
      -- Class enrollments tablosu için
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'class_enrollments' AND column_name = 'student_id') THEN
        ALTER TABLE public.class_enrollments ADD COLUMN student_id UUID REFERENCES public.profiles(id);
    END IF;
END $$;

-- Veri Uyumluluğu: Eğer student_id dolu ama user_id boş ise kopyala (Geriye dönük uyumluluk)
UPDATE public.purchases SET user_id = student_id WHERE user_id IS NULL AND student_id IS NOT NULL;
UPDATE public.reviews SET user_id = student_id WHERE user_id IS NULL AND student_id IS NOT NULL;

-- (Buradaki kolon isim değişikliği kodu kaldırıldı çünkü mevcut kod timestamp ve read kullanıyor)

-- =============================================
-- 3. RLS (ROW LEVEL SECURITY) POLİTİKALARI
-- =============================================

-- Enable RLS on All Tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;

-- 3.1 PROFILES POLICIES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3.2 GYM STORES POLICIES
DROP POLICY IF EXISTS "Stores are viewable by everyone" ON public.gym_stores;
CREATE POLICY "Stores are viewable by everyone" ON public.gym_stores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Coaches can create their own store" ON public.gym_stores;
CREATE POLICY "Coaches can create their own store" ON public.gym_stores FOR INSERT WITH CHECK (auth.uid() = coach_id);

DROP POLICY IF EXISTS "Coaches can update their own store" ON public.gym_stores;
CREATE POLICY "Coaches can update their own store" ON public.gym_stores FOR UPDATE USING (auth.uid() = coach_id);

-- 3.3 SALES PACKAGES POLICIES
DROP POLICY IF EXISTS "Packages are viewable by everyone" ON public.sales_packages;
CREATE POLICY "Packages are viewable by everyone" ON public.sales_packages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Coaches can create packages" ON public.sales_packages;
CREATE POLICY "Coaches can create packages" ON public.sales_packages FOR INSERT WITH CHECK (auth.uid() = coach_id);

DROP POLICY IF EXISTS "Coaches can update their own packages" ON public.sales_packages;
CREATE POLICY "Coaches can update their own packages" ON public.sales_packages FOR UPDATE USING (auth.uid() = coach_id);

DROP POLICY IF EXISTS "Coaches can delete their own packages" ON public.sales_packages;
CREATE POLICY "Coaches can delete their own packages" ON public.sales_packages FOR DELETE USING (auth.uid() = coach_id);

-- 3.4 PURCHASES POLICIES
-- Students can see their own purchases
DROP POLICY IF EXISTS "Students can view their own purchases" ON public.purchases;
CREATE POLICY "Students can view their own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Coaches can view purchases of their services" ON public.purchases;
-- Coaches can see purchases of their packages
CREATE POLICY "Coaches can view purchases of their services" ON public.purchases FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.sales_packages sp WHERE sp.id = package_id AND sp.coach_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.gym_stores gs WHERE gs.id = shop_id AND gs.coach_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can create purchases" ON public.purchases;
-- Students can create purchases (usually handled via server-side after payment, but allowing for now)
CREATE POLICY "Users can create purchases" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3.5 MESSAGES POLICIES
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 3.6 REVIEWS POLICIES
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Students can create reviews" ON public.reviews;
CREATE POLICY "Students can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3.7 GROUP CLASSES POLICIES
DROP POLICY IF EXISTS "Group classes are viewable by everyone" ON public.group_classes;
CREATE POLICY "Group classes are viewable by everyone" ON public.group_classes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Coaches can manage their classes" ON public.group_classes;
CREATE POLICY "Coaches can manage their classes" ON public.group_classes FOR ALL USING (auth.uid() = coach_id);

-- 3.8 CLASS ENROLLMENTS POLICIES
DROP POLICY IF EXISTS "Students can view their enrollments" ON public.class_enrollments;
CREATE POLICY "Students can view their enrollments" ON public.class_enrollments FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Coaches can view enrollments for their classes" ON public.class_enrollments;
CREATE POLICY "Coaches can view enrollments for their classes" ON public.class_enrollments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.group_classes gc WHERE gc.id = class_id AND gc.coach_id = auth.uid())
);

DROP POLICY IF EXISTS "Students can enroll themselves" ON public.class_enrollments;
CREATE POLICY "Students can enroll themselves" ON public.class_enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);

-- =============================================
-- 4. REALTIME SETUP
-- =============================================
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;

