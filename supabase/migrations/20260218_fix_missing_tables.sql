-- =============================================
-- FIX MISSING TABLES (Gym Stores & Sales Packages)
-- =============================================

-- 1. GYM STORES TABLE
CREATE TABLE IF NOT EXISTS public.gym_stores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coach_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_emoji TEXT DEFAULT '🏋️',
  theme_color TEXT DEFAULT '#3b82f6',
  instagram_url TEXT,
  category TEXT DEFAULT 'Genel',
  is_active BOOLEAN DEFAULT true,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  total_revenue NUMERIC DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. SALES PACKAGES TABLE
CREATE TABLE IF NOT EXISTS public.sales_packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coach_id UUID REFERENCES public.profiles(id) NOT NULL,
  shop_id UUID REFERENCES public.gym_stores(id),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  access_duration TEXT DEFAULT 'lifetime', -- human readable string if needed
  package_type TEXT CHECK (package_type IN ('coaching', 'program')) DEFAULT 'program',
  total_weeks INTEGER DEFAULT 4,
  sport TEXT,
  features TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  has_chat_support BOOLEAN DEFAULT false,
  has_group_class BOOLEAN DEFAULT false,
  max_students INTEGER DEFAULT 100,
  enrolled_students INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  program_content JSONB DEFAULT '[]'::jsonb, -- simplified for now
  workout_plan JSONB DEFAULT '[]'::jsonb,
  nutrition_plan JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ENABLE RLS
ALTER TABLE public.gym_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_packages ENABLE ROW LEVEL SECURITY;

-- 4. RE-APPLY RLS POLICIES (Just in case they were dropped or need to be ensured)

-- GYM STORES POLICIES
DROP POLICY IF EXISTS "Stores are viewable by everyone" ON public.gym_stores;
CREATE POLICY "Stores are viewable by everyone" ON public.gym_stores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Coaches can create their own store" ON public.gym_stores;
CREATE POLICY "Coaches can create their own store" ON public.gym_stores FOR INSERT WITH CHECK (auth.uid() = coach_id);

DROP POLICY IF EXISTS "Coaches can update their own store" ON public.gym_stores;
CREATE POLICY "Coaches can update their own store" ON public.gym_stores FOR UPDATE USING (auth.uid() = coach_id);

-- SALES PACKAGES POLICIES
DROP POLICY IF EXISTS "Packages are viewable by everyone" ON public.sales_packages;
CREATE POLICY "Packages are viewable by everyone" ON public.sales_packages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Coaches can create packages" ON public.sales_packages;
CREATE POLICY "Coaches can create packages" ON public.sales_packages FOR INSERT WITH CHECK (auth.uid() = coach_id);

DROP POLICY IF EXISTS "Coaches can update their own packages" ON public.sales_packages;
CREATE POLICY "Coaches can update their own packages" ON public.sales_packages FOR UPDATE USING (auth.uid() = coach_id);

DROP POLICY IF EXISTS "Coaches can delete their own packages" ON public.sales_packages;
CREATE POLICY "Coaches can delete their own packages" ON public.sales_packages FOR DELETE USING (auth.uid() = coach_id);
