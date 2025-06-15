
-- Add real-time sync fields to watch party sessions
ALTER TABLE public.watch_party_sessions 
ADD COLUMN IF NOT EXISTS sync_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS sync_position NUMERIC DEFAULT 0;

-- Update the cleanup function to be more comprehensive
CREATE OR REPLACE FUNCTION cleanup_expired_watch_party_sessions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Clean up expired sessions and their related data
  DELETE FROM public.watch_party_messages 
  WHERE session_id IN (
    SELECT id FROM public.watch_party_sessions 
    WHERE expires_at < now()
  );
  
  DELETE FROM public.watch_party_participants 
  WHERE session_id IN (
    SELECT id FROM public.watch_party_sessions 
    WHERE expires_at < now()
  );
  
  DELETE FROM public.watch_party_sessions 
  WHERE expires_at < now();
END;
$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watch_party_sessions_host_id ON public.watch_party_sessions(host_id);
CREATE INDEX IF NOT EXISTS idx_watch_party_participants_user_session ON public.watch_party_participants(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_watch_party_messages_session_user ON public.watch_party_messages(session_id, user_id);

-- Enable realtime for all watch party tables
ALTER TABLE public.watch_party_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.watch_party_participants REPLICA IDENTITY FULL;
ALTER TABLE public.watch_party_messages REPLICA IDENTITY FULL;

-- Add to realtime publication if not already added
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_party_sessions;
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
