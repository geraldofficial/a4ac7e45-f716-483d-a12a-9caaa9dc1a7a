
-- Create watch party sessions table
CREATE TABLE public.watch_party_sessions (
  id VARCHAR(6) NOT NULL PRIMARY KEY,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  movie_title TEXT NOT NULL,
  movie_type TEXT NOT NULL CHECK (movie_type IN ('movie', 'tv')),
  playback_time NUMERIC DEFAULT 0,
  is_playing BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours')
);

-- Create watch party participants table
CREATE TABLE public.watch_party_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(6) NOT NULL REFERENCES public.watch_party_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar TEXT DEFAULT '👤',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Create watch party messages table
CREATE TABLE public.watch_party_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(6) NOT NULL REFERENCES public.watch_party_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  type TEXT DEFAULT 'message' CHECK (type IN ('message', 'system', 'sync'))
);

-- Enable Row Level Security
ALTER TABLE public.watch_party_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_party_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_party_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Users can view sessions they participate in" ON public.watch_party_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.watch_party_participants 
      WHERE session_id = watch_party_sessions.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Host can create sessions" ON public.watch_party_sessions
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update sessions" ON public.watch_party_sessions
  FOR UPDATE USING (auth.uid() = host_id);

-- RLS Policies for participants
CREATE POLICY "Users can view participants in their sessions" ON public.watch_party_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.watch_party_participants p2
      WHERE p2.session_id = watch_party_participants.session_id 
      AND p2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join sessions" ON public.watch_party_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation" ON public.watch_party_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their sessions" ON public.watch_party_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.watch_party_participants 
      WHERE session_id = watch_party_messages.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages" ON public.watch_party_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL -- Allow system messages
  );

-- Enable realtime for all tables
ALTER TABLE public.watch_party_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.watch_party_participants REPLICA IDENTITY FULL;
ALTER TABLE public.watch_party_messages REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_party_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_party_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_party_messages;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_watch_party_sessions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.watch_party_sessions 
  WHERE expires_at < now();
END;
$$;

-- Create index for better performance
CREATE INDEX idx_watch_party_sessions_expires_at ON public.watch_party_sessions(expires_at);
CREATE INDEX idx_watch_party_participants_session_user ON public.watch_party_participants(session_id, user_id);
CREATE INDEX idx_watch_party_messages_session_timestamp ON public.watch_party_messages(session_id, timestamp);
