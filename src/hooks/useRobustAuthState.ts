
import { useEffect } from 'react';
import { useAuthStateManager } from './auth/useAuthStateManager';
import { useAuthProfileManager } from './auth/useAuthProfileManager';
import { useAuthStateListener } from './auth/useAuthStateListener';
import { useSessionChecker } from './auth/useSessionChecker';

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
    
    const { checkExistingSession } = useSessionChecker({
      mountedRef,
      loadingRef,
      setUser,
      setError,
      setLoading,
      createBasicUserProfile,
      fetchAndMergeProfile,
      safetyTimeout,
    });

    const initializeAuth = async () => {
      if (initializationAttempted.current) {
        console.log('🚫 Auth initialization already attempted');
        return;
      }
      
      initializationAttempted.current = true;
      
      try {
        // Set up auth state listener
        subscription = useAuthStateListener({
          mountedRef,
          loadingRef,
          setUser,
          setError,
          setLoading,
          createBasicUserProfile,
          fetchAndMergeProfile,
          safetyTimeout,
        });

        // Check for existing session
        await checkExistingSession();

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
