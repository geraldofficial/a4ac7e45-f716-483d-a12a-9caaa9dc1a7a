
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { userApi } from '@/services/user';
import { UserProfile } from '@/types/auth';

export const useAuthState = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let subscription: any;
    
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing auth...');
        
        // Set up auth state listener first
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('🔄 Auth state changed:', event, session?.user?.id || 'no-user');
          
          if (!mounted) {
            console.log('🚫 Component unmounted, ignoring auth state change');
            return;
          }
          
          try {
            if (event === 'SIGNED_IN' && session?.user) {
              console.log('✅ User signed in, fetching profile...');
              try {
                const profile = await userApi.getUserProfile(session.user.id);
                if (mounted) {
                  setUser({
                    id: session.user.id,
                    email: session.user.email,
                    ...profile,
                  });
                  console.log('👤 User profile loaded:', profile);
                }
              } catch (error) {
                console.error("❌ Error fetching user profile:", error);
                if (mounted) {
                  setUser({
                    id: session.user.id,
                    email: session.user.email,
                  });
                  console.log('👤 Basic user data set without profile');
                }
              }
            } else if (event === 'SIGNED_OUT') {
              console.log('🚪 User signed out');
              if (mounted) {
                setUser(null);
              }
            }
            
            // Always set loading to false after processing auth state change
            if (mounted) {
              console.log('✅ Setting loading to false after auth state change');
              setLoading(false);
            }
          } catch (error) {
            console.error('❌ Error processing auth state change:', error);
            if (mounted) {
              console.log('❌ Error occurred, setting loading to false');
              setLoading(false);
            }
          }
        });

        subscription = data.subscription;

        // Check for existing session
        try {
          console.log('🔍 Checking for existing session...');
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("❌ Session check failed:", error);
          } else if (session?.user) {
            console.log('📍 Found existing session for user:', session.user.id);
            try {
              const profile = await userApi.getUserProfile(session.user.id);
              if (mounted) {
                setUser({
                  id: session.user.id,
                  email: session.user.email,
                  ...profile,
                });
                console.log('👤 Existing user profile loaded:', profile);
              }
            } catch (error) {
              console.error("❌ Error fetching existing user profile:", error);
              if (mounted) {
                setUser({
                  id: session.user.id,
                  email: session.user.email,
                });
                console.log('👤 Basic existing user data set without profile');
              }
            }
          } else {
            console.log('📍 No existing session found');
          }
        } catch (sessionError) {
          console.error("💥 Critical session error:", sessionError);
        }
        
        // Final safety net - ensure loading is always set to false
        setTimeout(() => {
          if (mounted && loading) {
            console.log('🕒 Safety timeout: forcing loading to false');
            setLoading(false);
          }
        }, 2000);

      } catch (error) {
        console.error("💥 Auth initialization failed:", error);
        if (mounted) {
          console.log('❌ Auth init failed, setting loading to false');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('🧹 Cleaning up auth context');
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return { user, setUser, loading, setLoading };
};
