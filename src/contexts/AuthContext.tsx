import React, { createContext, useContext } from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuthStateManager } from '@/hooks/auth/useAuthStateManager';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useWatchlistActions } from '@/hooks/useWatchlistActions';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser, loading, setLoading, error, setError } = useAuthStateManager();
  const authActions = useAuthActions(user, setUser, setLoading);
  const watchlistActions = useWatchlistActions(user, authActions.updateProfile);

  const value: AuthContextType = {
    user,
    loading,
    error,
    ...authActions,
    ...watchlistActions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export type { UserProfile } from '@/types/auth';
