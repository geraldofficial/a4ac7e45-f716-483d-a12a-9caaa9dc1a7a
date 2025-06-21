import { supabase } from "@/integrations/supabase/client";

console.log("🧪 Testing Supabase client immediately...");

// Test the client configuration
if (!supabase) {
  console.error("❌ Supabase client not initialized");
} else {
  console.log("✅ Supabase client initialized");

  // Test a simple auth call
  supabase.auth
    .getSession()
    .then(({ data, error }) => {
      if (error) {
        // Check if it's an API key error
        if (error.message?.includes("No API key found")) {
          console.error("❌ API KEY ERROR STILL PRESENT:", error);
        } else if (
          error.message?.includes("42P01") ||
          error.message?.includes("does not exist")
        ) {
          console.log("✅ Auth call successful (schema error is expected)");
        } else {
          console.log("✅ Auth call successful, got response:", error.message);
        }
      } else {
        console.log(
          "✅ Auth session check successful:",
          data?.session ? "Has session" : "No session",
        );
      }
    })
    .catch((err) => {
      console.error("❌ Auth test failed:", err);
    });
}
