-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (Users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('student', 'coach', 'admin')) DEFAULT 'student',
    bio TEXT,
    sports TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GYM STORES (Coach Profiles/Stores)
CREATE TABLE public.gym_stores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE,
    logo_emoji TEXT DEFAULT '🏟️',
    contact_email TEXT,
    contact_phone TEXT,
    instagram_handle TEXT,
    youtube_url TEXT,
    rating NUMERIC DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPORT CATEGORIES
CREATE TABLE public.sport_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    is_system_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PACKAGES (Products)
CREATE TABLE public.sales_packages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shop_id UUID REFERENCES public.gym_stores(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES public.profiles(id),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image_url TEXT,
    highlight_color TEXT,
    package_type TEXT CHECK (package_type IN ('program', 'coaching', 'bundle')),
    duration_weeks INTEGER,
    features JSONB, -- Array of strings
    workout_plan JSONB, -- Storing structure for now
    nutrition_plan JSONB, 
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PURCHASES
CREATE TABLE public.purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    shop_id UUID REFERENCES public.gym_stores(id),
    package_id UUID REFERENCES public.sales_packages(id),
    amount_paid NUMERIC,
    status TEXT CHECK (status IN ('active', 'expired', 'cancelled')),
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    package_snapshot JSONB -- Snapshot of package details at purchase
);

-- GROUP CLASSES
CREATE TABLE public.group_classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coach_id UUID REFERENCES public.profiles(id),
    shop_id UUID REFERENCES public.gym_stores(id),
    title TEXT NOT NULL,
    description TEXT,
    sport TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER,
    max_participants INTEGER DEFAULT 20,
    meeting_link TEXT,
    price NUMERIC DEFAULT 0,
    status TEXT CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')) DEFAULT 'scheduled',
    recurrence TEXT CHECK (recurrence IN ('none', 'weekly')) DEFAULT 'none',
    recurrence_days INTEGER[], -- Array of day indices (0-6)
    recurrence_time TEXT, -- HH:mm
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLASS ENROLLMENTS
CREATE TABLE public.class_enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    class_id UUID REFERENCES public.group_classes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, user_id)
);

-- MESSAGES
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id),
    receiver_id UUID REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    image_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXERCISES & NUTRITION (As previously defined)
CREATE TABLE public.exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    difficulty TEXT,
    muscle_groups TEXT[],
    video_url TEXT,
    created_by UUID REFERENCES public.profiles(id),
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.progress_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id),
    weight_kg NUMERIC,
    notes TEXT,
    photos TEXT[],
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES (Simplified for initial startup)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- (Add other policies as needed)
