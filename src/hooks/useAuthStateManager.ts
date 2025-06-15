
import { useState, useCallback } from 'react';
import { UserProfile } from '@/types/auth';

export const useAuthStateManager = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateUser = useCallback((newUser: UserProfile | null) => {
    setUser(newUser);
    setError(null);
  }, []);

  const updateLoading = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  const updateError = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
    if (errorMessage) {
      setLoading(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setUser(null);
    setLoading(true);
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    updateUser,
    updateLoading,
    updateError,
    resetState
  };
};
