import { supabase } from "@/integrations/supabase/client";

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
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle(); // Changed from .single() to .maybeSingle()

    if (error) {
      // Handle Supabase error structure: message, details, code, status
      const errorMessage =
        error.message || error.details || error.hint || "Unknown error";
      const errorCode = error.code || "UNKNOWN";
      const statusCode = error.status || "";

      console.error("❌ Profile fetch error:", {
        message: errorMessage,
        code: errorCode,
        status: statusCode,
        originalError: error,
      });

      // Create a more informative error
      const fetchError = new Error(
        `Profile fetch failed [${errorCode}]: ${errorMessage}`,
      );
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
      // Handle Supabase error structure: message, details, code, status
      const errorMessage =
        error.message || error.details || error.hint || "Unknown error";
      const errorCode = error.code || "UNKNOWN";
      const statusCode = error.status || "";

      console.error("❌ Profile creation error:", {
        message: errorMessage,
        code: errorCode,
        status: statusCode,
        originalError: error,
      });

      // Create a more informative error
      const creationError = new Error(
        `Profile creation failed [${errorCode}]: ${errorMessage}`,
      );
      creationError.cause = error;
      throw creationError;
    }

    console.log("✅ Profile created:", data);
    return data;
  },
};
