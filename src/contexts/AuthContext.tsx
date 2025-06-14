import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { authApi } from '@/services/auth';
import { userApi } from '@/services/user';

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  avatar_url?: string;
  username?: string;
  full_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
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
          setUser(session.user);
        }
      } catch (error) {
        console.error("Authentication check failed", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authApi.signIn(email, password);
      if (response?.user) {
        setUser(response.user);
        toast({
          title: "Sign in successful!",
          description: `Welcome back, ${response.user.name || response.user.email}!`,
        });
        navigate('/');
      } else {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: "Invalid credentials. Please try again.",
        });
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
        setUser(response.user);
        toast({
          title: "Sign up successful!",
          description: `Welcome to FlickPick, ${response.user.name || response.user.email}!`,
        });
        navigate('/onboarding');
      } else {
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: "Could not create account. Please try again.",
        });
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

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
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
