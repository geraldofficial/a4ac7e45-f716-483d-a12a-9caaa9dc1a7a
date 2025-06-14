
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { userApi } from '@/services/user';

// Extended User type with our custom properties
interface User extends SupabaseUser {
  genre_preferences?: number[];
  onboarding_completed?: boolean;
  username?: string;
  avatar?: string;
  watchlist?: number[];
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{ error: any }>;
  completeOnboarding: (genrePreferences: number[]) => Promise<void>;
  addToWatchlist: (tmdbId: number) => void;
  removeFromWatchlist: (tmdbId: number) => void;
  isInWatchlist: (tmdbId: number) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await userApi.getUserProfile(userId);
      return profile;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        const profile = await loadUserProfile(session.user.id);
        const extendedUser: User = {
          ...session.user,
          genre_preferences: profile?.genre_preferences || [],
          onboarding_completed: profile?.onboarding_completed || false,
          username: profile?.username || session.user.email?.split('@')[0],
          avatar: profile?.avatar || '👤',
          watchlist: profile?.watchlist || []
        };
        setUser(extendedUser);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          setTimeout(async () => {
            const profile = await loadUserProfile(session.user.id);
            const extendedUser: User = {
              ...session.user,
              genre_preferences: profile?.genre_preferences || [],
              onboarding_completed: profile?.onboarding_completed || false,
              username: profile?.username || session.user.email?.split('@')[0],
              avatar: profile?.avatar || '👤',
              watchlist: profile?.watchlist || []
            };
            setUser(extendedUser);
          }, 0);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, userData = {}) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: any) => {
    if (!user) return { error: new Error('No user') };
    
    try {
      const updatedProfile = await userApi.updateUser(updates);
      
      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        ...updates,
        username: updates.username || prev.username,
        avatar: updates.avatar || prev.avatar,
        genre_preferences: updates.genre_preferences || prev.genre_preferences,
        watchlist: updates.watchlist || prev.watchlist
      } : null);
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const completeOnboarding = async (genrePreferences: number[]) => {
    if (!user) return;
    
    try {
      await userApi.updateUser({
        genre_preferences: genrePreferences,
        onboarding_completed: true
      });
      
      setUser(prev => prev ? {
        ...prev,
        genre_preferences: genrePreferences,
        onboarding_completed: true
      } : null);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const addToWatchlist = async (tmdbId: number) => {
    if (!user) return;
    
    const updatedWatchlist = [...(user.watchlist || []), tmdbId];
    await updateProfile({ watchlist: updatedWatchlist });
  };

  const removeFromWatchlist = async (tmdbId: number) => {
    if (!user) return;
    
    const updatedWatchlist = (user.watchlist || []).filter(id => id !== tmdbId);
    await updateProfile({ watchlist: updatedWatchlist });
  };

  const isInWatchlist = (tmdbId: number) => {
    return user?.watchlist?.includes(tmdbId) || false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      completeOnboarding,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
