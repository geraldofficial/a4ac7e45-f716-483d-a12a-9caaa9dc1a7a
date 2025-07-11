import { supabase } from "@/integrations/supabase/client";
import { safeLogError } from "@/utils/safeErrorFormat";

export const userApi = {
  async updateUser(updates: any) {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", (await supabase.auth.getUser()).data.user?.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserProfile(userId: string) {
    console.log("🔍 Fetching profile for user:", userId);

    try {
      // Fetch all available fields from the profiles table (email is in auth.users, not profiles)
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, username, created_at, updated_at, watchlist, avatar, genre_preferences, onboarding_completed, email_welcomed, full_name",
        )
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        // Handle specific error types
        if (error.code === "42P01") {
          console.info(
            "Profiles table not yet created. User profile unavailable.",
          );
          return null;
        }

        // Use safe error logging to avoid body stream issues
        safeLogError("❌ Profile fetch error", error);

        // Create a more informative error
        const fetchError = new Error(`Profile fetch failed: ${formattedError}`);
        fetchError.cause = error;
        throw fetchError;
      }

      console.log("✅ Profile fetch result:", data);
      return data;
    } catch (error) {
      // Handle network and other fetch errors
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        console.warn(
          "❌ Network error fetching profile. Check internet connection or Supabase configuration.",
        );
        // Return null instead of throwing to prevent app crashes
        return null;
      }

      // Re-throw other errors
      throw error;
    }
  },

  async createUserProfile(userId: string, basicData: any = {}) {
    console.log("🆕 Creating profile for user:", userId);
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        username: basicData.username || null,
        full_name: basicData.full_name || null,
        avatar: basicData.avatar || "👤",
        watchlist: [],
        genre_preferences: [],
        onboarding_completed: false,
        email_welcomed: false,
        ...basicData,
      })
      .select()
      .single();

    if (error) {
      // Use safe error logging to avoid body stream issues
      safeLogError("❌ Profile creation error", error);

      // Create a more informative error
      const creationError = new Error(
        `Profile creation failed: ${formattedError}`,
      );
      creationError.cause = error;
      throw creationError;
    }

    console.log("✅ Profile created:", data);
    return data;
  },
};
