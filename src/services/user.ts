import { supabase } from "@/integrations/supabase/client";
import { formatError } from "@/lib/utils";

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
    // Fetch only essential fields to reduce query complexity and avoid timeouts
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, username, full_name, avatar, email, watchlist, genre_preferences, onboarding_completed",
      )
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      // Use formatError to properly format the error message
      const formattedError = formatError(error);
      console.error("❌ Profile fetch error:", formattedError);

      // Create a more informative error
      const fetchError = new Error(`Profile fetch failed: ${formattedError}`);
      fetchError.cause = error;
      throw fetchError;
    }

    console.log("✅ Profile fetch result:", data);
    return data;
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
      // Use formatError to properly format the error message
      const formattedError = formatError(error);
      console.error("❌ Profile creation error:", formattedError);

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
