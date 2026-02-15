-- Create group_classes table
CREATE TABLE IF NOT EXISTS public.group_classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shop_id TEXT, -- Can be linked to a store if needed
    package_id UUID REFERENCES public.sales_packages(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    sport TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL,
    max_participants INTEGER DEFAULT 20,
    enrolled_participants JSONB DEFAULT '[]'::jsonb, -- Array of user IDs
    meeting_link TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
    price DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.group_classes ENABLE ROW LEVEL SECURITY;

-- Policies for group_classes

-- Everyone can view classes (public catalog)
CREATE POLICY "Public classes are viewable by everyone" 
ON public.group_classes FOR SELECT 
USING (true);

-- Coaches can insert/update/delete their own classes
CREATE POLICY "Coaches can manage their own classes" 
ON public.group_classes FOR ALL 
USING (auth.uid() = coach_id);

-- Create helper function to check if user enrolled (optional but good for future)
-- For now, enrolled_participants is a JSONB array, simple to check in application code or via specialized pg ops if needed.
