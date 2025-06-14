
import React, { createContext, useState, useEffect, useContext } from 'react';
import { userApi } from '@/services/user';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, AuthContextType } from '@/types/auth';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { useWatchlistOperations } from '@/hooks/useWatchlistOperations';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const authOperations = useAuthOperations(setUser, setLoading, user);
  const watchlistOperations = useWatchlistOperations(user, authOperations.updateProfile);

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id);
          
          if (!mounted) return;
          
          if (event === 'SIGNED_IN' && session?.user) {
            setTimeout(async () => {
              try {
                const profile = await userApi.getUserProfile(session.user.id);
                if (mounted) {
                  setUser({
                    id: session.user.id,
                    email: session.user.email,
                    ...profile,
                  });
                }
              } catch (error) {
                console.error("Error fetching user profile:", error);
                if (mounted) {
                  setUser({
                    id: session.user.id,
                    email: session.user.email,
                  });
                }
              }
            }, 0);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
          
          if (mounted) {
            setLoading(false);
          }
        });

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check failed:", error);
        }
        
        if (mounted && session?.user) {
          try {
            const profile = await userApi.getUserProfile(session.user.id);
            setUser({
              id: session.user.id,
              email: session.user.email,
              ...profile,
            });
          } catch (error) {
            console.error("Error fetching user profile:", error);
            setUser({
              id: session.user.id,
              email: session.user.email,
            });
          }
        }
        
        if (mounted) {
          setLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization failed:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    ...authOperations,
    ...watchlistOperations,
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
