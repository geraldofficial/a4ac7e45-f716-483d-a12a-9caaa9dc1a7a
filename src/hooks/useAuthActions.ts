import { useToast } from "@/hooks/use-toast";
import { userApi } from "@/services/user";
import { authApi } from "@/services/auth";
import { UserProfile } from "@/types/auth";
import { formatError } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from "@/utils/authCleanup";

export const useAuthActions = (
  user: UserProfile | null,
  setUser: (user: UserProfile | null) => void,
  setLoading: (loading: boolean) => void,
) => {
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      cleanupAuthState();

      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch (err) {
        // Continue even if this fails
      }

      const response = await authApi.signIn(email, password);
      if (response?.user) {
        toast({
          title: "Sign in successful!",
          description: `Welcome back!`,
        });
        // Force a complete page reload to ensure clean state
        window.location.href = "/";
      }
    } catch (error: any) {
      console.error("Sign-in error:", formatError(error));
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message || "Invalid email or password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: any = {},
  ) => {
    setLoading(true);
    try {
      cleanupAuthState();

      const response = await authApi.signUp(email, password, userData);
      if (response?.user) {
        toast({
          title: "Sign up successful!",
          description: `Welcome to FlickPick! Please check your email to verify your account.`,
        });

        window.location.href = "/onboarding";
      }
    } catch (error: any) {
      console.error("Sign-up error:", formatError(error));
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
      // Clear state immediately
      setUser(null);

      // Clean up all auth state including profiles
      cleanupAuthState();

      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch (err) {
        console.warn("Sign out error:", err);
      }

      toast({
        description: "Signed out successfully!",
      });

      // Force complete page reload to clear all state
      window.location.href = "/auth";
    } catch (error: any) {
      console.error("Sign-out error:", formatError(error));
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
      const newUser = user
        ? { ...user, ...updatedUser }
        : (updatedUser as UserProfile);
      setUser(newUser);
      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Profile update error:", formatError(error));
      toast({
        variant: "destructive",
        title: "Profile update failed",
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
    signup: (email: string, password: string, username?: string) =>
      signUp(email, password, { username }),
  };
};
