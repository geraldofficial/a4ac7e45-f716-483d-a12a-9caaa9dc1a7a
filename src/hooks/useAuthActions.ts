
import { useToast } from "@/components/ui/use-toast";
import { authApi } from '@/services/auth';
import { userApi } from '@/services/user';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState } from '@/utils/authCleanup';
import { UserProfile } from '@/types/auth';

export const useAuthActions = (
  user: UserProfile | null,
  setUser: (user: UserProfile | null) => void,
  setLoading: (loading: boolean) => void
) => {
  const { toast } = useToast();

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

  return {
    signIn,
    signUp,
    signOut,
    updateProfile,
    login: signIn,
    signup: (email: string, password: string, username?: string) => signUp(email, password, { username }),
  };
};
