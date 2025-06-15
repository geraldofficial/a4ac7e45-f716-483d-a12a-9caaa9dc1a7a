
-- Fix the RLS policy for watch party sessions creation
-- The current policy is too restrictive and preventing session creation
DROP POLICY IF EXISTS "Host can create sessions" ON public.watch_party_sessions;

-- Create a more permissive policy that allows authenticated users to create sessions
CREATE POLICY "Authenticated users can create sessions" ON public.watch_party_sessions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = host_id);

-- Also ensure the sessions policy allows users to view sessions they participate in
DROP POLICY IF EXISTS "Users can view sessions they participate in" ON public.watch_party_sessions;

CREATE POLICY "Users can view sessions they participate in" ON public.watch_party_sessions
  FOR SELECT USING (public.user_is_in_session(id));
