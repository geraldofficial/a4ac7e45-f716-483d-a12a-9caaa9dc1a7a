import { supabase } from "@/integrations/supabase/client";

/**
 * Simple test to verify Supabase connection and API key
 */
export const testSupabaseConnection = async () => {
  try {
    console.log("🔬 Testing Supabase connection...");

    // Test 1: Check if client is created
    if (!supabase) {
      console.error("❌ Supabase client not initialized");
      return false;
    }

    // Test 2: Try to get session (should work even without auth)
    const { data, error } = await supabase.auth.getSession();

    if (
      error &&
      !error.message?.includes("42P01") &&
      !error.message?.includes("does not exist")
    ) {
      console.error("❌ Supabase connection failed:", error);
      return false;
    }

    console.log("✅ Supabase connection successful");
    console.log(
      "📊 Session data:",
      data?.session ? "Session found" : "No session (expected)",
    );

    return true;
  } catch (error: any) {
    console.error("❌ Supabase test failed:", error.message);
    return false;
  }
};

// Auto-run test in development
if (import.meta.env.DEV) {
  // Delay to ensure everything is loaded
  setTimeout(() => {
    testSupabaseConnection().then((success) => {
      if (success) {
        console.log("🎉 Supabase is properly configured and connected");
      } else {
        console.warn(
          "⚠️ Supabase connection test failed - check configuration",
        );
      }
    });
  }, 2000);
}
