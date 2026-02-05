-- =============================================
-- FITNESS COACHING APP - DATABASE SCHEMA
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE
-- Stores user profile information with role
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('coach', 'student')) DEFAULT 'student',
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. COACH-STUDENT RELATIONSHIP TABLE
-- Links coaches to their students
-- =============================================
CREATE TABLE IF NOT EXISTS public.coach_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'inactive')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(coach_id, student_id)
);

-- =============================================
-- 3. EXERCISE CATEGORIES TABLE
-- Categories for organizing exercises
-- =============================================
CREATE TABLE IF NOT EXISTS public.exercise_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. EXERCISES TABLE
-- Exercise library with animation references
-- =============================================
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    animation_url TEXT,
    animation_type TEXT CHECK (animation_type IN ('lottie', 'video', 'gif', 'css')) DEFAULT 'css',
    category_id UUID REFERENCES public.exercise_categories(id) ON DELETE SET NULL,
    muscle_groups TEXT[],
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    duration_seconds INTEGER,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. WORKOUT PLANS TABLE
-- Workout plans created by coaches
-- =============================================
CREATE TABLE IF NOT EXISTS public.workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration_weeks INTEGER DEFAULT 4,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. ASSIGNED WORKOUTS TABLE
-- Workouts assigned to students
-- =============================================
CREATE TABLE IF NOT EXISTS public.assigned_workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    workout_plan_id UUID REFERENCES public.workout_plans(id) ON DELETE SET NULL,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7),
    sets INTEGER NOT NULL DEFAULT 3,
    reps INTEGER NOT NULL DEFAULT 10,
    rest_seconds INTEGER DEFAULT 60,
    weight_kg DECIMAL(5,2),
    notes TEXT,
    order_index INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. NUTRITION PLANS TABLE
-- Nutrition plans for students
-- =============================================
CREATE TABLE IF NOT EXISTS public.nutrition_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    daily_calories INTEGER,
    protein_grams INTEGER,
    carbs_grams INTEGER,
    fat_grams INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. MEALS TABLE
-- Individual meals within nutrition plans
-- =============================================
CREATE TABLE IF NOT EXISTS public.meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nutrition_plan_id UUID NOT NULL REFERENCES public.nutrition_plans(id) ON DELETE CASCADE,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    name TEXT NOT NULL,
    description TEXT,
    meal_details TEXT,
    calories INTEGER,
    protein_grams INTEGER,
    carbs_grams INTEGER,
    fat_grams INTEGER,
    time_of_day TIME,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 9. PROGRESS TRACKING TABLE
-- Track student progress over time
-- =============================================
CREATE TABLE IF NOT EXISTS public.progress_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),
    muscle_mass_kg DECIMAL(5,2),
    notes TEXT,
    photo_urls TEXT[],
    logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 10. MESSAGES TABLE
-- Chat messages between coaches and students
-- =============================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 11. SPORT CATEGORIES TABLE
-- Custom sport categories created by coaches
-- =============================================
CREATE TABLE IF NOT EXISTS public.sport_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    color TEXT DEFAULT 'green',
    is_system_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 12. SALES PACKAGES TABLE
-- Packages sold by coaches
-- =============================================
CREATE TABLE IF NOT EXISTS public.sales_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    access_duration TEXT DEFAULT '1 Ay',
    package_type TEXT CHECK (package_type IN ('workout', 'nutrition', 'bundle')) DEFAULT 'workout',
    total_weeks INTEGER DEFAULT 4,
    sport_category_id UUID REFERENCES public.sport_categories(id) ON DELETE SET NULL,
    features TEXT[],
    has_chat_support BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assigned_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Coaches can view their students profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.coach_students cs
            WHERE cs.coach_id = auth.uid() AND cs.student_id = profiles.id
        )
    );

CREATE POLICY "Students can view their coach profile" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.coach_students cs
            WHERE cs.student_id = auth.uid() AND cs.coach_id = profiles.id
        )
    );

-- Coach-Students policies
CREATE POLICY "Coaches can manage their student relationships" ON public.coach_students
    FOR ALL USING (coach_id = auth.uid());

CREATE POLICY "Students can view their coach relationships" ON public.coach_students
    FOR SELECT USING (student_id = auth.uid());

-- Exercise categories policies (public read)
CREATE POLICY "Anyone can view exercise categories" ON public.exercise_categories
    FOR SELECT USING (true);

-- Exercises policies
CREATE POLICY "Anyone can view public exercises" ON public.exercises
    FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Coaches can create exercises" ON public.exercises
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'coach')
    );

CREATE POLICY "Coaches can update their exercises" ON public.exercises
    FOR UPDATE USING (created_by = auth.uid());

-- Workout plans policies
CREATE POLICY "Coaches can manage their workout plans" ON public.workout_plans
    FOR ALL USING (coach_id = auth.uid());

-- Assigned workouts policies
CREATE POLICY "Coaches can manage assigned workouts" ON public.assigned_workouts
    FOR ALL USING (coach_id = auth.uid());

CREATE POLICY "Students can view their assigned workouts" ON public.assigned_workouts
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can update completion status" ON public.assigned_workouts
    FOR UPDATE USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- Nutrition plans policies
CREATE POLICY "Coaches can manage nutrition plans" ON public.nutrition_plans
    FOR ALL USING (coach_id = auth.uid());

CREATE POLICY "Students can view their nutrition plans" ON public.nutrition_plans
    FOR SELECT USING (student_id = auth.uid());

-- Meals policies
CREATE POLICY "Users can view meals from their nutrition plans" ON public.meals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.nutrition_plans np
            WHERE np.id = meals.nutrition_plan_id
            AND (np.coach_id = auth.uid() OR np.student_id = auth.uid())
        )
    );

CREATE POLICY "Coaches can manage meals" ON public.meals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.nutrition_plans np
            WHERE np.id = meals.nutrition_plan_id
            AND np.coach_id = auth.uid()
        )
    );

-- Progress logs policies
CREATE POLICY "Students can manage their progress logs" ON public.progress_logs
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Coaches can view their students progress" ON public.progress_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.coach_students cs
            WHERE cs.coach_id = auth.uid() AND cs.student_id = progress_logs.student_id
        )
    );

-- Enable RLS on new tables
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sport_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_packages ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view their own messages" ON public.messages
    FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Senders can update their messages" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid());

-- Sport categories policies
CREATE POLICY "Anyone can view sport categories" ON public.sport_categories
    FOR SELECT USING (true);

CREATE POLICY "Coaches can manage their sport categories" ON public.sport_categories
    FOR ALL USING (coach_id = auth.uid() OR is_system_default = true);

-- Sales packages policies
CREATE POLICY "Anyone can view published packages" ON public.sales_packages
    FOR SELECT USING (is_published = true OR coach_id = auth.uid());

CREATE POLICY "Coaches can manage their packages" ON public.sales_packages
    FOR ALL USING (coach_id = auth.uid());

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coach_students_updated_at
    BEFORE UPDATE ON public.coach_students
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at
    BEFORE UPDATE ON public.exercises
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_plans_updated_at
    BEFORE UPDATE ON public.workout_plans
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assigned_workouts_updated_at
    BEFORE UPDATE ON public.assigned_workouts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nutrition_plans_updated_at
    BEFORE UPDATE ON public.nutrition_plans
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED DATA - Exercise Categories
-- =============================================
INSERT INTO public.exercise_categories (name, description, icon, color) VALUES
    ('Göğüs', 'Göğüs kaslarını hedefleyen egzersizler', 'heart', '#ef4444'),
    ('Sırt', 'Sırt kaslarını hedefleyen egzersizler', 'arrow-up', '#3b82f6'),
    ('Bacak', 'Alt vücut egzersizleri', 'footprints', '#22c55e'),
    ('Omuz', 'Omuz kaslarını hedefleyen egzersizler', 'circle-dot', '#f59e0b'),
    ('Kol', 'Kol kaslarını hedefleyen egzersizler', 'dumbbell', '#8b5cf6'),
    ('Karın', 'Core ve karın egzersizleri', 'target', '#ec4899'),
    ('Kardiyo', 'Kardiyovasküler egzersizler', 'activity', '#06b6d4')
ON CONFLICT DO NOTHING;

-- =============================================
-- SEED DATA - Sample Exercises
-- =============================================
INSERT INTO public.exercises (name, description, instructions, animation_type, muscle_groups, difficulty) VALUES
    ('Bench Press', 'Klasik göğüs egzersizi', '1. Sırta uzanın\n2. Barı göğüs hizasında tutun\n3. Kontrollü şekilde indirin\n4. Yukarı itin', 'css', ARRAY['göğüs', 'triceps'], 'intermediate'),
    ('Squat', 'Bacak için temel egzersiz', '1. Ayaklar omuz genişliğinde\n2. Kalçayı geri itin\n3. Dizler 90 derece olana kadar inin\n4. Yukarı itin', 'css', ARRAY['quadriceps', 'glutes'], 'beginner'),
    ('Deadlift', 'Tüm vücut egzersizi', '1. Barın önünde durun\n2. Kalçadan eğilin\n3. Barı kavrayın\n4. Bacak ve sırt gücüyle kaldırın', 'css', ARRAY['sırt', 'bacak', 'core'], 'advanced'),
    ('Pull-up', 'Sırt için etkili egzersiz', '1. Barı omuz genişliğinde kavrayın\n2. Çeneniz bara gelene kadar çekin\n3. Kontrollü inin', 'css', ARRAY['sırt', 'biceps'], 'intermediate'),
    ('Shoulder Press', 'Omuz geliştirme egzersizi', '1. Dambılları omuz hizasında tutun\n2. Yukarı itin\n3. Kontrollü indirin', 'css', ARRAY['omuz', 'triceps'], 'beginner'),
    ('Plank', 'Core güçlendirme', '1. Ön kol üzerinde destek alın\n2. Vücudu düz tutun\n3. Pozisyonu koruyun', 'css', ARRAY['core', 'karın'], 'beginner'),
    ('Bicep Curl', 'Kol egzersizi', '1. Dambılları yanınızda tutun\n2. Dirsekten bükün\n3. Omuz hizasına getirin\n4. Kontrollü indirin', 'css', ARRAY['biceps'], 'beginner'),
    ('Lunges', 'Bacak egzersizi', '1. Dik durun\n2. Bir adım öne atın\n3. Arka diz yere yaklaşana kadar inin\n4. Başlangıç pozisyonuna dönün', 'css', ARRAY['quadriceps', 'glutes'], 'beginner')
ON CONFLICT DO NOTHING;
