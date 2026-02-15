-- Add active_program_id to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_program_id UUID REFERENCES sales_packages(id);
