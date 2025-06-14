
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { authApi } from '@/services/auth';
import { userApi } from '@/services/user';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  avatar_url?: string;
  avatar?: string;
  username?: string;
  full_name?: string;
  created_at?: string;
  updated_at?: string;
  watchlist?: number[];
  genre_preferences?: number[];
  onboarding_completed?: boolean;
  email_welcomed?: boolean;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username?: string) => Promise<void>;
  addToWatchlist: (movieId: number) => Promise<void>;
  removeFromWatchlist: (movieId: number) => Promise<void>;
  isInWatchlist: (movieId: number) => boolean;
  completeOnboarding: (preferences: number[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cleanup function to clear auth state
const cleanupAuthState = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id);
          
          if (!mounted) return;
          
          if (event === 'SIGNED_IN' && session?.user) {
            // Use setTimeout to prevent deadlock
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

        // Then check for existing session
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

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Clean up existing state first
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const response = await authApi.signIn(email, password);
      if (response?.user) {
        toast({
          title: "Sign in successful!",
          description: `Welcome back!`,
        });
        // Force page reload for clean state
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error("Sign-in error:", error);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message || "Invalid email or password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const signUp = async (email: string, password: string, userData: any = {}) => {
    setLoading(true);
    try {
      // Clean up existing state first
      cleanupAuthState();
      
      const response = await authApi.signUp(email, password, userData);
      if (response?.user) {
        toast({
          title: "Sign up successful!",
          description: `Welcome to FlickPick! Please check your email to verify your account.`,
        });
        
        // Force page reload for clean state
        window.location.href = '/onboarding';
      }
    } catch (error: any) {
      console.error("Sign-up error:", error);
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up.",
      });
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, username?: string) => {
    await signUp(email, password, { username });
  };

  const signOut = async () => {
    setLoading(true);
    try {
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      setUser(null);
      toast({
        description: "Signed out successfully!",
      });
      
      // Force page reload for clean state
      window.location.href = '/auth';
    } catch (error: any) {
      console.error("Sign-out error:", error);
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message || "An error occurred during sign out.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      const updatedUser = await userApi.updateUser(updates);
      setUser((prevUser) => {
        return prevUser ? { ...prevUser, ...updatedUser } : updatedUser as UserProfile
      });
      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        variant: "destructive",
        title: "Profile update failed",
        description: error.message || "Failed to update profile.",
      });
    }
  };

  const addToWatchlist = async (movieId: number) => {
    if (!user) return;
    
    const currentWatchlist = user.watchlist || [];
    if (!currentWatchlist.includes(movieId)) {
      const newWatchlist = [...currentWatchlist, movieId];
      await updateProfile({ watchlist: newWatchlist });
    }
  };

  const removeFromWatchlist = async (movieId: number) => {
    if (!user) return;
    
    const currentWatchlist = user.watchlist || [];
    const newWatchlist = currentWatchlist.filter(id => id !== movieId);
    await updateProfile({ watchlist: newWatchlist });
  };

  const isInWatchlist = (movieId: number): boolean => {
    if (!user || !user.watchlist) return false;
    return user.watchlist.includes(movieId);
  };

  const completeOnboarding = async (preferences: number[]) => {
    await updateProfile({ 
      genre_preferences: preferences, 
      onboarding_completed: true 
    });
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    login,
    signup,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    completeOnboarding,
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
