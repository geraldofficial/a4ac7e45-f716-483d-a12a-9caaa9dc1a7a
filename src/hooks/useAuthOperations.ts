import React from 'react';
import { toast } from '@/components/ui/sonner';
import { authApi } from '@/services/auth';
import { userApi } from '@/services/user';
import { cleanupAuthState } from '@/utils/authUtils';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';

export const useAuthOperations = (
  setUser: (user: UserProfile | null) => void,
  setLoading: (loading: boolean) => void,
  user: UserProfile | null
) => {
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
        toast.success("Sign in successful!", {
          description: `Welcome back!`,
        });
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error("Sign-in error:", error);
      toast.error("Sign in failed", {
        description: error.message || "Invalid email or password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any = {}) => {
    setLoading(true);
    try {
      cleanupAuthState();
      
      const response = await authApi.signUp(email, password, userData);
      if (response?.user) {
        toast.success("Sign up successful!", {
          description: `Welcome to FlickPick! Please check your email to verify your account.`,
        });
        
        window.location.href = '/onboarding';
      }
    } catch (error: any) {
      console.error("Sign-up error:", error);
      toast.error("Sign up failed", {
        description: error.message || "An error occurred during sign up.",
      });
    } finally {
      setLoading(false);
    }
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
      toast.success("Signed out successfully!");
      
      window.location.href = '/auth';
    } catch (error: any) {
      console.error("Sign-out error:", error);
      toast.error("Sign out failed", {
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
      const newUser: UserProfile = { ...user, ...updatedUser };
      setUser(newUser);
      toast.success("Profile updated!", {
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error("Profile update failed", {
        description: error.message || "Failed to update profile.",
      });
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    updateProfile,
    login: signIn,
    signup: signUp,
  };
};
