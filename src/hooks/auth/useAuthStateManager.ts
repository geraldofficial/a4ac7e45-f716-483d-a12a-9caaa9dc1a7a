
import { useState, useRef } from 'react';
import { UserProfile } from '@/types/auth';

export const useAuthStateManager = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const loadingRef = useRef(true);
  const initializationAttempted = useRef(false);

  return {
    user,
    setUser,
    loading,
    setLoading,
    error,
    setError,
    mountedRef,
    loadingRef,
    initializationAttempted,
  };
};
