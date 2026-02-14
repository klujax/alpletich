-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('student', 'coach', 'admin')),
  bio TEXT,
  phone TEXT,
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- GYM STORES
CREATE TABLE IF NOT EXISTS public.gym_stores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coach_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image TEXT,
  logo_url TEXT,
  tags TEXT[], -- Array of strings
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  min_price NUMERIC DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  contact_email TEXT,
  contact_phone TEXT,
  instagram_handle TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SALES PACKAGES
CREATE TABLE IF NOT EXISTS public.sales_packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coach_id UUID REFERENCES public.profiles(id) NOT NULL,
  shop_id UUID REFERENCES public.gym_stores(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  access_duration TEXT,
  package_type TEXT CHECK (package_type IN ('program', 'coaching')),
  total_weeks INTEGER,
  max_students INTEGER,
  enrolled_students INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  features TEXT[],
  sport TEXT,
  has_chat_support BOOLEAN DEFAULT FALSE,
  has_group_class BOOLEAN DEFAULT FALSE,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  workout_plan JSONB, -- Stores the workout plan JSON structure
  program_content TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PURCHASES
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  package_id UUID REFERENCES public.sales_packages(id) NOT NULL,
  shop_id UUID REFERENCES public.gym_stores(id) NOT NULL,
  amount_paid NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('active', 'completed', 'expired', 'cancelled')) DEFAULT 'active',
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  package_snapshot JSONB -- Stores copy of package details at purchase time
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) NOT NULL,
  content TEXT,
  image_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  coach_id UUID REFERENCES public.profiles(id) NOT NULL,
  shop_id UUID REFERENCES public.gym_stores(id) NOT NULL,
  package_id UUID REFERENCES public.sales_packages(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- STORAGE BUCKETS (Must vary by Supabase project but usually handled via dashboard/API. This is instructional.)
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- insert into storage.buckets (id, name, public) values ('exercise-videos', 'exercise-videos', true);
-- insert into storage.buckets (id, name, public) values ('message-images', 'message-images', true);

-- REALTIME publication
-- alter publication supabase_realtime add table messages;
