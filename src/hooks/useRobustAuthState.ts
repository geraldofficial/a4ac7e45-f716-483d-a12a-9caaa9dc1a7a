import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { userApi } from '@/services/user';
import { UserProfile } from '@/types/auth';

export const useRobustAuthState = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const loadingRef = useRef(true); // Use ref for loading state
  const initializationAttempted = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    loadingRef.current = true;
    let subscription: any;
    
    console.log('🔐 Starting robust auth initialization...');
    
    // Safety timeout using ref to avoid stale closure
    const safetyTimeout = setTimeout(() => {
      if (mountedRef.current && loadingRef.current) {
        console.log('⏰ Safety timeout: forcing loading to false');
        setLoading(false);
        loadingRef.current = false;
        setError('Authentication took too long to initialize');
      }
    }, 5000);
    
    const createBasicUserProfile = (authUser: any): UserProfile => {
      console.log('👤 Creating basic user profile for:', authUser.id);
      return {
        id: authUser.id,
        email: authUser.email,
        username: authUser.user_metadata?.username || null,
        full_name: authUser.user_metadata?.full_name || null,
        avatar: authUser.user_metadata?.avatar || '👤',
        watchlist: [],
        genre_preferences: [],
        onboarding_completed: false,
        email_welcomed: false,
      };
    };

    const fetchAndMergeProfile = async (userId: string, basicUser: UserProfile): Promise<UserProfile> => {
      try {
        console.log('🔍 Fetching extended profile for user:', userId);
        let profile = await userApi.getUserProfile(userId);
        
        // If no profile exists, create one
        if (!profile) {
          console.log('📝 No profile found, creating one...');
          try {
            profile = await userApi.createUserProfile(userId, {
              username: basicUser.username,
              full_name: basicUser.full_name,
              avatar: basicUser.avatar,
            });
          } catch (createError) {
            console.warn('⚠️ Failed to create profile, using basic user data:', createError);
            return basicUser;
          }
        }
        
        // Merge profile data with basic user data
        const fullUser: UserProfile = {
          ...basicUser,
          ...profile,
          // Ensure required fields are never null/undefined
          watchlist: profile.watchlist || [],
          genre_preferences: profile.genre_preferences || [],
          onboarding_completed: profile.onboarding_completed || false,
          email_welcomed: profile.email_welcomed || false,
        };
        
        console.log('🎉 Full user profile merged:', fullUser.id);
        return fullUser;
      } catch (error) {
        console.warn('⚠️ Profile fetch/merge failed, using basic profile:', error);
        return basicUser;
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
                
                // Defer extended profile fetching with proper error handling
                setTimeout(async () => {
                  if (mountedRef.current) {
                    try {
                      const fullUser = await fetchAndMergeProfile(session.user.id, basicUser);
                      if (mountedRef.current) {
                        setUser(fullUser);
                        console.log('🎉 Full user profile loaded successfully');
                      }
                    } catch (profileError) {
                      console.warn('⚠️ Profile loading failed, keeping basic user:', profileError);
                      // Keep the basic user, don't set error
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
              loadingRef.current = false;
              clearTimeout(safetyTimeout);
            }
          } catch (error) {
            console.error('❌ Error in auth state change:', error);
            if (mountedRef.current) {
              setError(error instanceof Error ? error.message : 'Authentication error');
              setLoading(false);
              loadingRef.current = false;
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
            loadingRef.current = false;
            clearTimeout(safetyTimeout);
          }
        } else if (session?.user) {
          console.log('📍 Found existing session:', session.user.id);
          
          // Set basic user immediately
          const basicUser = createBasicUserProfile(session.user);
          
          if (mountedRef.current) {
            setUser(basicUser);
            setError(null);
            
            // Defer extended profile fetching with proper error handling
            setTimeout(async () => {
              if (mountedRef.current) {
                try {
                  const fullUser = await fetchAndMergeProfile(session.user.id, basicUser);
                  if (mountedRef.current) {
                    setUser(fullUser);
                    console.log('🎉 Existing user profile loaded successfully');
                  }
                } catch (profileError) {
                  console.warn('⚠️ Existing profile loading failed, keeping basic user:', profileError);
                  // Keep the basic user, don't set error
                }
              }
            }, 100);
            
            setLoading(false);
            loadingRef.current = false;
            clearTimeout(safetyTimeout);
          }
        } else {
          console.log('📍 No existing session found');
          if (mountedRef.current) {
            setLoading(false);
            loadingRef.current = false;
            clearTimeout(safetyTimeout);
          }
        }

      } catch (error) {
        console.error('💥 Auth initialization failed:', error);
        if (mountedRef.current) {
          setError(error instanceof Error ? error.message : 'Failed to initialize authentication');
          setLoading(false);
          loadingRef.current = false;
          clearTimeout(safetyTimeout);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('🧹 Cleaning up robust auth state');
      mountedRef.current = false;
      loadingRef.current = false;
      clearTimeout(safetyTimeout);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return { user, setUser, loading, setLoading, error, setError };
};
