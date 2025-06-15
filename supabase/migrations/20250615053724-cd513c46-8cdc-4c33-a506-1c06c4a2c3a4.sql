
-- Create user profiles table for multiple profiles per account
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '👤',
  is_child BOOLEAN DEFAULT false,
  age_restriction INTEGER DEFAULT 18,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Add viewing preferences table
CREATE TABLE public.viewing_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  preferred_genres INTEGER[] DEFAULT '{}',
  preferred_languages TEXT[] DEFAULT '{"en"}',
  subtitle_language TEXT DEFAULT 'en',
  auto_play BOOLEAN DEFAULT true,
  content_filter TEXT DEFAULT 'all', -- 'all', 'family', 'teen', 'mature'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add content ratings table
CREATE TABLE public.content_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER NOT NULL,
  content_type TEXT NOT NULL, -- 'movie' or 'tv'
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id, tmdb_id, content_type)
);

-- Add watch progress tracking table
CREATE TABLE public.watch_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  season INTEGER,
  episode INTEGER,
  progress_seconds INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  completed BOOLEAN DEFAULT false,
  last_watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id, tmdb_id, content_type, season, episode)
);

-- Enable Row Level Security (fixed syntax)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewing_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profiles" 
  ON public.user_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profiles" 
  ON public.user_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles" 
  ON public.user_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profiles" 
  ON public.user_profiles 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for viewing_preferences
CREATE POLICY "Users can manage preferences for their profiles" 
  ON public.viewing_preferences 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = profile_id AND user_id = auth.uid()
    )
  );

-- Create RLS policies for content_ratings
CREATE POLICY "Users can manage ratings for their profiles" 
  ON public.content_ratings 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = profile_id AND user_id = auth.uid()
    )
  );

-- Create RLS policies for watch_progress
CREATE POLICY "Users can manage watch progress for their profiles" 
  ON public.watch_progress 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = profile_id AND user_id = auth.uid()
    )
  );
