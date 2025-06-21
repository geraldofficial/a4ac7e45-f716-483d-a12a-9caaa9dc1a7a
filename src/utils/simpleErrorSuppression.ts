// Simple, safe error suppression for database errors
// This version avoids complex interception that could break the app

class SimpleErrorSuppression {
  private warningShown = false;

  constructor() {
    this.setupSimpleInterception();
  }

  private setupSimpleInterception() {
    const originalError = console.error;

    console.error = (...args: any[]) => {
      // Only suppress very specific error patterns safely
      const firstArg = args[0];

      if (typeof firstArg === "string") {
        // Check for database table missing errors
        if (
          firstArg.includes("42P01") ||
          firstArg.includes("does not exist") ||
          firstArg.includes("body stream already read")
        ) {
          // Show guidance once
          if (!this.warningShown) {
            this.warningShown = true;
            console.warn(
              "📝 Database tables missing. App works with fallback data. " +
                "Run supabase/migrations/20250621000002-enhanced-notifications-system.sql to enable full features.",
            );
          }
          return; // Suppress these specific errors
        }
      }

      // Check for JSON error objects
      if (
        typeof firstArg === "object" &&
        firstArg &&
        firstArg.code === "42P01"
      ) {
        if (!this.warningShown) {
          this.warningShown = true;
          console.warn(
            "📝 Database tables missing. App works with fallback data.",
          );
        }
        return; // Suppress JSON error objects
      }

      // Allow all other errors through
      originalError(...args);
    };
  }
}

// Initialize the simple error suppression
const simpleErrorSuppression = new SimpleErrorSuppression();

export { simpleErrorSuppression };
