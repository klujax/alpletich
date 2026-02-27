-- =============================================
-- ADD MISSING COLUMNS TO sales_packages TABLE
-- =============================================

-- These columns exist in the code but were never added to the DB
-- because the initial CREATE TABLE didn't include them, and the
-- later migration used IF NOT EXISTS which skipped the table.

ALTER TABLE public.sales_packages ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.gym_stores(id);
ALTER TABLE public.sales_packages ADD COLUMN IF NOT EXISTS sport TEXT;
ALTER TABLE public.sales_packages ADD COLUMN IF NOT EXISTS has_group_class BOOLEAN DEFAULT false;
ALTER TABLE public.sales_packages ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 100;
ALTER TABLE public.sales_packages ADD COLUMN IF NOT EXISTS enrolled_students INTEGER DEFAULT 0;
ALTER TABLE public.sales_packages ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0;
ALTER TABLE public.sales_packages ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE public.sales_packages ADD COLUMN IF NOT EXISTS program_content JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.sales_packages ADD COLUMN IF NOT EXISTS workout_plan JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.sales_packages ADD COLUMN IF NOT EXISTS nutrition_plan JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.sales_packages ADD COLUMN IF NOT EXISTS access_duration TEXT DEFAULT 'lifetime';

-- Profiles tablosuna da yeni alanlar ekleyelim (kayıt formundan gelen)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sports_history TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sports TEXT;
