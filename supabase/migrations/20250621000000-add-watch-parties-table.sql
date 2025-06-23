-- Create watch_parties table for backward compatibility with existing components
-- This is different from watch_party_sessions and serves as an alternative implementation

CREATE TABLE IF NOT EXISTS public.watch_parties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_title TEXT NOT NULL,
  movie_poster TEXT,
  movie_src TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  is_playing BOOLEAN DEFAULT false,
  current_time NUMERIC DEFAULT 0,
  playback_rate NUMERIC DEFAULT 1,
  updated_by UUID REFERENCES auth.users(id),
  max_participants INTEGER DEFAULT 50
);

-- Create watch_party_participants table for the watch_parties system
CREATE TABLE IF NOT EXISTS public.watch_party_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  watch_party_id UUID NOT NULL REFERENCES public.watch_parties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_host BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(watch_party_id, user_id)
);

-- Create watch_party_messages table for the watch_parties system
CREATE TABLE IF NOT EXISTS public.watch_party_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  watch_party_id UUID NOT NULL REFERENCES public.watch_parties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  message_type TEXT DEFAULT 'message' -- 'message', 'system', 'sync'
);

-- Enable Row Level Security
ALTER TABLE public.watch_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_party_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_party_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for watch_parties
CREATE POLICY "Users can view parties they participate in" ON public.watch_parties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.watch_party_participants 
      WHERE watch_party_id = watch_parties.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create parties" ON public.watch_parties
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Hosts can update parties" ON public.watch_parties
  FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for watch_party_participants
CREATE POLICY "Users can view participants in their parties" ON public.watch_party_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.watch_party_participants p2
      WHERE p2.watch_party_id = watch_party_participants.watch_party_id 
      AND p2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join parties" ON public.watch_party_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation" ON public.watch_party_participants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave parties" ON public.watch_party_participants
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for watch_party_messages
CREATE POLICY "Users can view messages in their parties" ON public.watch_party_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.watch_party_participants 
      WHERE watch_party_id = watch_party_messages.watch_party_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages" ON public.watch_party_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.watch_party_participants 
      WHERE watch_party_id = watch_party_messages.watch_party_id 
      AND user_id = auth.uid()
    )
  );

-- Enable realtime for all watch party tables
ALTER TABLE public.watch_parties REPLICA IDENTITY FULL;
ALTER TABLE public.watch_party_participants REPLICA IDENTITY FULL;
ALTER TABLE public.watch_party_messages REPLICA IDENTITY FULL;

-- Add tables to realtime publication
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_parties;
    EXCEPTION
        WHEN duplicate_object THEN
            NULL; -- Table already in publication
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_party_participants;
    EXCEPTION
        WHEN duplicate_object THEN
            NULL; -- Table already in publication
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_party_messages;
    EXCEPTION
        WHEN duplicate_object THEN
            NULL; -- Table already in publication
    END;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watch_parties_created_by ON public.watch_parties(created_by);
CREATE INDEX IF NOT EXISTS idx_watch_parties_is_active ON public.watch_parties(is_active);
CREATE INDEX IF NOT EXISTS idx_watch_party_participants_party_user ON public.watch_party_participants(watch_party_id, user_id);
CREATE INDEX IF NOT EXISTS idx_watch_party_messages_party_created ON public.watch_party_messages(watch_party_id, created_at);

-- Function to clean up inactive parties
CREATE OR REPLACE FUNCTION cleanup_inactive_watch_parties()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Clean up parties that have been inactive for more than 24 hours
  DELETE FROM public.watch_parties 
  WHERE updated_at < (now() - interval '24 hours') 
  AND is_active = false;
END;
$$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to update updated_at column
CREATE TRIGGER update_watch_parties_updated_at 
    BEFORE UPDATE ON public.watch_parties 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
