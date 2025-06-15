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
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error cleaning up auth state:', error);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    let subscription: any;
    
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing auth...');
        
        // Set up auth state listener first
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('🔄 Auth state changed:', event, session?.user?.id);
          
          if (!mounted) return;
          
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('✅ User signed in, fetching profile...');
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
              console.error("❌ Error fetching user profile:", error);
              if (mounted) {
                setUser({
                  id: session.user.id,
                  email: session.user.email,
                });
              }
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('🚪 User signed out');
            if (mounted) {
              setUser(null);
            }
          }
          
          // Always set loading to false after auth state change
          if (mounted) {
            setLoading(false);
          }
        });

        subscription = data.subscription;

        // Check for existing session with timeout
        const sessionTimeout = setTimeout(() => {
          console.log('⏰ Session check timeout, setting loading to false');
          if (mounted) {
            setLoading(false);
          }
        }, 3000); // 3 second timeout

        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          clearTimeout(sessionTimeout);
          
          if (error) {
            console.error("❌ Session check failed:", error);
            cleanupAuthState();
          } else if (session?.user) {
            console.log('📍 Found existing session for user:', session.user.id);
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
              console.error("❌ Error fetching user profile:", error);
              if (mounted) {
                setUser({
                  id: session.user.id,
                  email: session.user.email,
                });
              }
            }
          } else {
            console.log('📍 No existing session found');
          }
        } catch (sessionError) {
          clearTimeout(sessionTimeout);
          console.error("💥 Critical session error:", sessionError);
          cleanupAuthState();
        }
        
        // Ensure loading is set to false
        if (mounted) {
          setLoading(false);
        }

      } catch (error) {
        console.error("💥 Auth initialization failed:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      cleanupAuthState();
      
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
      cleanupAuthState();
      
      const response = await authApi.signUp(email, password, userData);
      if (response?.user) {
        toast({
          title: "Sign up successful!",
          description: `Welcome to FlickPick! Please check your email to verify your account.`,
        });
        
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
