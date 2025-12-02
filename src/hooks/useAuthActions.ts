import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/services/auth";
import { UserProfile } from "@/types/auth";
import { safeLogError } from "@/utils/safeErrorFormat";
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
      } catch (err) {}

      const response = await authApi.signIn(email, password);
      if (response?.user) {
        toast({
          title: "Sign in successful!",
          description: `Welcome back!`,
        });
        window.location.href = "/";
      }
    } catch (error: any) {
      safeLogError("Sign-in error", error);
      toast({
        variant: "destructive",
        title: "Sign in failed",
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
        toast({
          title: "Sign up successful!",
          description: `Welcome to FlickPick!`,
        });
        window.location.href = "/onboarding";
      }
    } catch (error: any) {
      safeLogError("Sign-up error", error);
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
      setUser(null);
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch (err) {}
      toast({ description: "Signed out successfully!" });
      window.location.href = "/auth";
    } catch (error: any) {
      safeLogError("Sign-out error", error);
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
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      setUser({ ...user, ...updates });
      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      safeLogError("Profile update error", error);
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
