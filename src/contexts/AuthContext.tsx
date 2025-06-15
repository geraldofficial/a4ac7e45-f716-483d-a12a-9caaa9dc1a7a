
import React, { createContext, useContext } from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useWatchlistActions } from '@/hooks/useWatchlistActions';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser, loading, setLoading } = useAuthState();
  const authActions = useAuthActions(user, setUser, setLoading);
  const watchlistActions = useWatchlistActions(user, authActions.updateProfile);

  const value: AuthContextType = {
    user,
    loading,
    ...authActions,
    ...watchlistActions,
  };

  console.log('🎯 AuthProvider render - loading:', loading, 'user:', user?.id || 'none');

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
