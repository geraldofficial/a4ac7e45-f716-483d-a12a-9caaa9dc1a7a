import { useState, useEffect, useRef } from 'react';
import { UserProfile } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

export const useAuthStateManager = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const initializationAttempted = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    
    const initializeAuth = async () => {
      if (initializationAttempted.current) return;
      initializationAttempted.current = true;

      try {
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mountedRef.current) {
            setLoading(false);
          }
          return;
        }

        if (session?.user && mountedRef.current) {
          // Fetch profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            username: profile?.username || session.user.user_metadata?.username,
            full_name: profile?.full_name || session.user.user_metadata?.full_name,
            avatar: profile?.avatar || session.user.user_metadata?.avatar_url,
            watchlist: [],
          });
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;

        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setLoading(false);
          return;
        }

        if (session?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(async () => {
            if (!mountedRef.current) return;
            
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (mountedRef.current) {
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  username: profile?.username || session.user.user_metadata?.username,
                  full_name: profile?.full_name || session.user.user_metadata?.full_name,
                  avatar: profile?.avatar || session.user.user_metadata?.avatar_url,
                  watchlist: [],
                });
                setLoading(false);
              }
            } catch (err) {
              console.error('Profile fetch error:', err);
              if (mountedRef.current) {
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  watchlist: [],
                });
                setLoading(false);
              }
            }
          }, 0);
        }
      }
    );

    initializeAuth();

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    setUser,
    loading,
    setLoading,
    error,
    setError,
    mountedRef,
  };
};
