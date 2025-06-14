
-- Add missing columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_welcomed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS full_name text;
