-- =============================================
-- MISSING TABLES MIGRATION
-- Run this in Supabase SQL Editor to create missing tables
-- =============================================

-- 1. GYM STORES TABLE
CREATE TABLE IF NOT EXISTS public.gym_stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    logo_emoji TEXT DEFAULT '🏋️',
    theme_color TEXT DEFAULT 'green',
    contact_email TEXT,
    contact_phone TEXT,
    instagram_handle TEXT,
    youtube_url TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_banned BOOLEAN DEFAULT false,
    ban_reason TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for gym_stores
ALTER TABLE public.gym_stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active stores" ON public.gym_stores
    FOR SELECT USING (is_active = true AND is_banned = false);

CREATE POLICY "Coaches can manage their own store" ON public.gym_stores
    FOR ALL USING (coach_id = auth.uid());

-- 2. UPDATE SALES PACKAGES (Add shop_id)
ALTER TABLE public.sales_packages 
ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES public.gym_stores(id) ON DELETE SET NULL;

-- 3. GROUP CLASSES TABLE
CREATE TABLE IF NOT EXISTS public.group_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.gym_stores(id) ON DELETE SET NULL,
    package_id UUID REFERENCES public.sales_packages(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    sport TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    max_participants INTEGER DEFAULT 20,
    meeting_link TEXT,
    status TEXT CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')) DEFAULT 'scheduled',
    price DECIMAL(10,2) DEFAULT 0,
    recurrence TEXT CHECK (recurrence IN ('none', 'weekly')) DEFAULT 'none',
    recurrence_days INTEGER[], -- 0=Sun, 1=Mon...
    recurrence_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for group_classes
ALTER TABLE public.group_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scheduled classes" ON public.group_classes
    FOR SELECT USING (status != 'cancelled');

CREATE POLICY "Coaches can manage their classes" ON public.group_classes
    FOR ALL USING (coach_id = auth.uid());

-- 4. CLASS ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS public.class_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.group_classes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(class_id, user_id)
);

-- Enable RLS for class_enrollments
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their enrollments" ON public.class_enrollments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Coaches can view enrollments for their classes" ON public.class_enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_classes gc
            WHERE gc.id = class_enrollments.class_id AND gc.coach_id = auth.uid()
        )
    );

CREATE POLICY "Users can enroll themselves" ON public.class_enrollments
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- 5. PURCHASES TABLE
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.gym_stores(id) ON DELETE SET NULL,
    package_id UUID REFERENCES public.sales_packages(id) ON DELETE SET NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    status TEXT CHECK (status IN ('active', 'expired', 'cancelled', 'refunded')) DEFAULT 'active',
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    package_snapshot JSONB -- Store a copy of package details at time of purchase
);

-- Enable RLS for purchases
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchases" ON public.purchases
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Coaches can view purchases of their packages" ON public.purchases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.sales_packages sp
            WHERE sp.id = purchases.package_id AND sp.coach_id = auth.uid()
        )
    );

CREATE POLICY "Users can create purchases" ON public.purchases
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- 6. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.gym_stores(id) ON DELETE SET NULL,
    package_id UUID REFERENCES public.sales_packages(id) ON DELETE SET NULL,
    student_name TEXT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Students can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (student_id = auth.uid());
