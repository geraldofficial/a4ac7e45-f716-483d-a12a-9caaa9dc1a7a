
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view participants in their sessions" ON public.watch_party_participants;
DROP POLICY IF EXISTS "Users can view messages in their sessions" ON public.watch_party_messages;

-- Create security definer functions to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.user_is_in_session(session_id_param VARCHAR(6))
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.watch_party_participants 
    WHERE session_id = session_id_param 
    AND user_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create new policies using the security definer function
CREATE POLICY "Users can view participants in their sessions" ON public.watch_party_participants
  FOR SELECT USING (public.user_is_in_session(session_id));

CREATE POLICY "Users can view messages in their sessions" ON public.watch_party_messages
  FOR SELECT USING (public.user_is_in_session(session_id));
