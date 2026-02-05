-- =============================================
-- STORAGE BUCKET SETUP
-- Run this in Supabase SQL Editor to set up file storage
-- =============================================

-- 1. Create 'avatars' bucket (Publicly accessible)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can view avatars
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

-- Policy: Authenticated users can upload avatars
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- =============================================

-- 2. Create 'message-images' bucket (Private - Auth only)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('message-images', 'message-images', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Authenticated users can view message images
CREATE POLICY "Authenticated users can view message images"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'message-images' AND auth.role() = 'authenticated' );

-- Policy: Authenticated users can upload message images
CREATE POLICY "Authenticated users can upload message images"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'message-images' AND auth.role() = 'authenticated' );

-- =============================================

-- 3. Create 'progress-photos' bucket (Private - Auth only)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('progress-photos', 'progress-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Authenticated users can view progress photos
CREATE POLICY "Authenticated users can view progress photos"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'progress-photos' AND auth.role() = 'authenticated' );

-- Policy: Authenticated users can upload progress photos
CREATE POLICY "Authenticated users can upload progress photos"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'progress-photos' AND auth.role() = 'authenticated' );
