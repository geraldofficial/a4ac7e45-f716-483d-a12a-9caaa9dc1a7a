import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';

interface UseSessionCheckerProps {
  mountedRef: React.MutableRefObject<boolean>;
  loadingRef: React.MutableRefObject<boolean>;
  setUser: (user: UserProfile | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  createBasicUserProfile: (authUser: any) => UserProfile;
  fetchAndMergeProfile: (userId: string, basicUser: UserProfile) => Promise<UserProfile>;
  safetyTimeout: NodeJS.Timeout;
}

export const useSessionChecker = ({
  mountedRef,
  loadingRef,
  setUser,
  setError,
  setLoading,
  createBasicUserProfile,
  fetchAndMergeProfile,
  safetyTimeout,
}: UseSessionCheckerProps) => {
  const checkExistingSession = async () => {
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
  };

  return { checkExistingSession };
};
