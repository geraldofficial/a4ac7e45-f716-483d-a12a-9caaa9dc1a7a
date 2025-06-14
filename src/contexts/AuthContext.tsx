
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authApi.getSession();
        if (session?.user) {
          // Get user profile from profiles table
          const profile = await userApi.getUserProfile(session.user.id);
          setUser({
            id: session.user.id,
            email: session.user.email,
            ...profile,
          });
        }
      } catch (error) {
        console.error("Authentication check failed", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const profile = await userApi.getUserProfile(session.user.id);
          const userData = {
            id: session.user.id,
            email: session.user.email,
            ...profile,
          };
          setUser(userData);
          
          // Send welcome email for new users
          if (event === 'SIGNED_IN' && !profile?.email_welcomed) {
            try {
              await supabase.functions.invoke('send-welcome-email', {
                body: {
                  email: session.user.email,
                  name: profile?.username || profile?.full_name
                }
              });
              
              // Mark user as welcomed
              await userApi.updateUser({ email_welcomed: true });
            } catch (emailError) {
              console.error('Failed to send welcome email:', emailError);
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authApi.signIn(email, password);
      if (response?.user) {
        const profile = await userApi.getUserProfile(response.user.id);
        setUser({
          id: response.user.id,
          email: response.user.email,
          ...profile,
        });
        toast({
          title: "Sign in successful!",
          description: `Welcome back!`,
        });
        navigate('/');
      }
    } catch (error: any) {
      console.error("Sign-in error:", error);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message || "An error occurred during sign in.",
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any = {}) => {
    setLoading(true);
    try {
      const response = await authApi.signUp(email, password, userData);
      if (response?.user) {
        toast({
          title: "Sign up successful!",
          description: `Welcome to FlickPick!`,
        });
        
        // Send welcome email
        try {
          await supabase.functions.invoke('send-welcome-email', {
            body: {
              email: email,
              name: userData.username || userData.full_name
            }
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }
        
        navigate('/onboarding');
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
      await authApi.signOut();
      setUser(null);
      toast({
        description: "Signed out successfully!",
      });
      navigate('/auth');
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
    setLoading(true);
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
    } finally {
      setLoading(false);
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
