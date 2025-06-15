
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStateManager } from './auth/useAuthStateManager';
import { useAuthProfileManager } from './auth/useAuthProfileManager';

export const useRobustAuthState = () => {
  const {
    user,
    setUser,
    loading,
    setLoading,
    error,
    setError,
    mountedRef,
    loadingRef,
    initializationAttempted,
  } = useAuthStateManager();

  const { createBasicUserProfile, fetchAndMergeProfile } = useAuthProfileManager();

  useEffect(() => {
    mountedRef.current = true;
    loadingRef.current = true;
    let subscription: any;
    let safetyTimeout: NodeJS.Timeout;
    
    console.log('🔐 Starting robust auth initialization...');
    
    const initializeAuth = async () => {
      try {
        // Clear any existing error
        if (mountedRef.current) {
          setError(null);
        }

        // Set up safety timeout with longer duration
        safetyTimeout = setTimeout(() => {
          if (mountedRef.current && loadingRef.current) {
            console.log('⏰ Safety timeout: forcing loading to false after 10 seconds');
            setLoading(false);
            loadingRef.current = false;
            setError('Authentication initialization timed out. Please refresh the page.');
          }
        }, 10000); // Increased to 10 seconds

        // Set up auth state listener
        console.log('🎯 Setting up auth state listener...');
        
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('🔄 Auth state changed:', event, session?.user?.id || 'no-user');
          
          if (!mountedRef.current) {
            console.log('🚫 Component unmounted, ignoring auth state change');
            return;
          }
          
          try {
            if (event === 'SIGNED_IN' && session?.user) {
              console.log('✅ User signed in, setting basic profile...');
              
              // Clear the safety timeout since we have a successful sign in
              if (safetyTimeout) {
                clearTimeout(safetyTimeout);
              }
              
              // Set basic user data immediately
              const basicUser = createBasicUserProfile(session.user);
              
              if (mountedRef.current) {
                setUser(basicUser);
                setError(null);
                setLoading(false);
                loadingRef.current = false;
                console.log('👤 Basic user set:', basicUser.id);
                
                // Defer extended profile fetching
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
                    }
                  }
                }, 100);
              }
              
            } else if (event === 'SIGNED_OUT') {
              console.log('🚪 User signed out');
              if (safetyTimeout) {
                clearTimeout(safetyTimeout);
              }
              if (mountedRef.current) {
                setUser(null);
                setError(null);
                setLoading(false);
                loadingRef.current = false;
              }
            } else if (event === 'TOKEN_REFRESHED') {
              console.log('🔄 Token refreshed');
              // Don't change loading state for token refresh
            } else {
              // For other events, ensure loading is false
              if (mountedRef.current) {
                setLoading(false);
                loadingRef.current = false;
                if (safetyTimeout) {
                  clearTimeout(safetyTimeout);
                }
              }
            }
            
          } catch (error) {
            console.error('❌ Error in auth state change:', error);
            if (safetyTimeout) {
              clearTimeout(safetyTimeout);
            }
            if (mountedRef.current) {
              setError(error instanceof Error ? error.message : 'Authentication error');
              setLoading(false);
              loadingRef.current = false;
            }
          }
        });

        subscription = data.subscription;

        // Check for existing session with delay to avoid race conditions
        setTimeout(async () => {
          if (!mountedRef.current) return;
          
          console.log('🔍 Checking for existing session...');
          try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
              console.error('❌ Session check failed:', sessionError);
              if (mountedRef.current) {
                setError('Failed to check authentication status');
                setLoading(false);
                loadingRef.current = false;
                if (safetyTimeout) {
                  clearTimeout(safetyTimeout);
                }
              }
            } else if (session?.user) {
              console.log('📍 Found existing session:', session.user.id);
              
              // Clear the safety timeout
              if (safetyTimeout) {
                clearTimeout(safetyTimeout);
              }
              
              // Set basic user immediately
              const basicUser = createBasicUserProfile(session.user);
              
              if (mountedRef.current) {
                setUser(basicUser);
                setError(null);
                setLoading(false);
                loadingRef.current = false;
                
                // Defer extended profile fetching
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
                    }
                  }
                }, 100);
              }
            } else {
              console.log('📍 No existing session found');
              if (mountedRef.current) {
                setLoading(false);
                loadingRef.current = false;
                if (safetyTimeout) {
                  clearTimeout(safetyTimeout);
                }
              }
            }
          } catch (error) {
            console.error('💥 Session check failed:', error);
            if (safetyTimeout) {
              clearTimeout(safetyTimeout);
            }
            if (mountedRef.current) {
              setError(error instanceof Error ? error.message : 'Failed to check authentication status');
              setLoading(false);
              loadingRef.current = false;
            }
          }
        }, 100); // Small delay to avoid race conditions

      } catch (error) {
        console.error('💥 Auth initialization failed:', error);
        if (safetyTimeout) {
          clearTimeout(safetyTimeout);
        }
        if (mountedRef.current) {
          setError(error instanceof Error ? error.message : 'Failed to initialize authentication');
          setLoading(false);
          loadingRef.current = false;
        }
      }
    };

    // Reset initialization flag and start
    initializationAttempted.current = false;
    initializeAuth();

    return () => {
      console.log('🧹 Cleaning up robust auth state');
      mountedRef.current = false;
      loadingRef.current = false;
      if (safetyTimeout) {
        clearTimeout(safetyTimeout);
      }
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []); // Empty dependency array to ensure this only runs once

  return { user, setUser, loading, setLoading, error, setError };
};
