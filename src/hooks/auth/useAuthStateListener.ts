import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';

interface UseAuthStateListenerProps {
  mountedRef: React.MutableRefObject<boolean>;
  loadingRef: React.MutableRefObject<boolean>;
  setUser: (user: UserProfile | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  createBasicUserProfile: (authUser: any) => UserProfile;
  fetchAndMergeProfile: (userId: string, basicUser: UserProfile) => Promise<UserProfile>;
  safetyTimeout: NodeJS.Timeout;
}

export const useAuthStateListener = ({
  mountedRef,
  loadingRef,
  setUser,
  setError,
  setLoading,
  createBasicUserProfile,
  fetchAndMergeProfile,
  safetyTimeout,
}: UseAuthStateListenerProps) => {
  useEffect(() => {
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

    return data.subscription;
  }, [
    mountedRef,
    loadingRef,
    setUser,
    setError,
    setLoading,
    createBasicUserProfile,
    fetchAndMergeProfile,
    safetyTimeout,
  ]);
};
