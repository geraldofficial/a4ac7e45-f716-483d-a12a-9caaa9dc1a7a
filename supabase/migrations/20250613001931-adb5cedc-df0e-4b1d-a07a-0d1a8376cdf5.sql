
-- Add avatar and genre preferences columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN avatar TEXT DEFAULT '👤',
ADD COLUMN genre_preferences INTEGER[] DEFAULT '{}',
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;

-- Update the handle_new_user function to set default avatar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar, genre_preferences, onboarding_completed)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username',
    '👤',
    '{}',
    FALSE
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
