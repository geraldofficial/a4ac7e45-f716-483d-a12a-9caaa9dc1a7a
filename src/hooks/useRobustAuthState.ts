
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { userApi } from '@/services/user';
import { UserProfile } from '@/types/auth';

export const useRobustAuthState = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const initializationAttempted = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    let subscription: any;
    
    console.log('🔐 Starting robust auth initialization...');
    
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (mountedRef.current && loading) {
        console.log('⏰ Safety timeout: forcing loading to false');
        setLoading(false);
        setError('Authentication took too long to initialize');
      }
    }, 5000);
    
    const createBasicUserProfile = (authUser: any): UserProfile => {
      console.log('👤 Creating basic user profile for:', authUser.id);
      return {
        id: authUser.id,
        email: authUser.email,
        // Set safe defaults for required fields
        username: authUser.user_metadata?.username || null,
        full_name: authUser.user_metadata?.full_name || null,
        avatar: authUser.user_metadata?.avatar || null,
        watchlist: [],
        genre_preferences: [],
        onboarding_completed: false,
        email_welcomed: false,
      };
    };

    const fetchProfileSafely = async (userId: string): Promise<Partial<UserProfile> | null> => {
      try {
        console.log('🔍 Fetching profile for user:', userId);
        const profile = await userApi.getUserProfile(userId);
        console.log('✅ Profile fetched successfully:', profile);
        return profile;
      } catch (error) {
        console.warn('⚠️ Profile fetch failed, using basic profile:', error);
        return null;
      }
    };

    const initializeAuth = async () => {
      if (initializationAttempted.current) {
        console.log('🚫 Auth initialization already attempted');
        return;
      }
      
      initializationAttempted.current = true;
      
      try {
        console.log('🎯 Setting up auth state listener...');
        
        // Set up auth state listener
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('🔄 Auth state changed:', event, session?.user?.id || 'no-user');
          
          if (!mountedRef.current) {
            console.log('🚫 Component unmounted, ignoring auth state change');
            return;
          }
          
          try {
            if (event === 'SIGNED_IN' && session?.user) {
              console.log('✅ User signed in, setting basic profile...');
              
              // Set basic user data immediately
              const basicUser = createBasicUserProfile(session.user);
              
              if (mountedRef.current) {
                setUser(basicUser);
                setError(null);
                console.log('👤 Basic user set:', basicUser.id);
                
                // Defer extended profile fetching to avoid blocking
                setTimeout(async () => {
                  if (mountedRef.current) {
                    const extendedProfile = await fetchProfileSafely(session.user.id);
                    
                    if (mountedRef.current && extendedProfile) {
                      const fullUser: UserProfile = {
                        ...basicUser,
                        ...extendedProfile,
                      };
                      setUser(fullUser);
                      console.log('🎉 Full user profile loaded');
                    }
                  }
                }, 100);
              }
              
            } else if (event === 'SIGNED_OUT') {
              console.log('🚪 User signed out');
              if (mountedRef.current) {
                setUser(null);
                setError(null);
              }
            }
            
            // Always clear loading state after processing
            if (mountedRef.current) {
              setLoading(false);
              clearTimeout(safetyTimeout);
            }
          } catch (error) {
            console.error('❌ Error in auth state change:', error);
            if (mountedRef.current) {
              setError(error instanceof Error ? error.message : 'Authentication error');
              setLoading(false);
              clearTimeout(safetyTimeout);
            }
          }
        });

        subscription = data.subscription;

        // Check for existing session
        console.log('🔍 Checking for existing session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session check failed:', sessionError);
          if (mountedRef.current) {
            setError('Failed to check authentication status');
            setLoading(false);
            clearTimeout(safetyTimeout);
          }
        } else if (session?.user) {
          console.log('📍 Found existing session:', session.user.id);
          
          // Set basic user immediately
          const basicUser = createBasicUserProfile(session.user);
          
          if (mountedRef.current) {
            setUser(basicUser);
            setError(null);
            
            // Defer extended profile fetching
            setTimeout(async () => {
              if (mountedRef.current) {
                const extendedProfile = await fetchProfileSafely(session.user.id);
                
                if (mountedRef.current && extendedProfile) {
                  const fullUser: UserProfile = {
                    ...basicUser,
                    ...extendedProfile,
                  };
                  setUser(fullUser);
                  console.log('🎉 Existing user profile loaded');
                }
              }
            }, 100);
            
            setLoading(false);
            clearTimeout(safetyTimeout);
          }
        } else {
          console.log('📍 No existing session found');
          if (mountedRef.current) {
            setLoading(false);
            clearTimeout(safetyTimeout);
          }
        }

      } catch (error) {
        console.error('💥 Auth initialization failed:', error);
        if (mountedRef.current) {
          setError(error instanceof Error ? error.message : 'Failed to initialize authentication');
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('🧹 Cleaning up robust auth state');
      mountedRef.current = false;
      clearTimeout(safetyTimeout);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return { user, setUser, loading, setLoading, error, setError };
};
