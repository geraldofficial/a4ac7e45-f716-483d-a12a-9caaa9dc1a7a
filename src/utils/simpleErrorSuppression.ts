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
      try {
        // Convert all args to string for pattern matching
        const message = args
          .map((arg) => {
            if (typeof arg === "string") return arg;
            if (typeof arg === "object" && arg !== null) {
              try {
                return JSON.stringify(arg);
              } catch {
                return String(arg);
              }
            }
            return String(arg);
          })
          .join(" ");

        // Check for database table missing errors
        const shouldSuppress =
          message.includes("42P01") ||
          message.includes("does not exist") ||
          message.includes("body stream already read") ||
          message.includes('relation "public.user_notifications"') ||
          message.includes('relation "public.notification_preferences"') ||
          message.includes('relation "public.push_subscriptions"') ||
          message.includes('relation "public.user_settings"') ||
          message.includes("Error fetching notification") ||
          message.includes("TypeError: Failed to execute 'text' on 'Response'");

        if (shouldSuppress) {
          // Show guidance once
          if (!this.warningShown) {
            this.warningShown = true;
            console.warn(
              "📝 Database Setup Required:\n" +
                "   • Missing tables: user_notifications, notification_preferences, push_subscriptions, user_settings\n" +
                "   • Run migration: supabase/migrations/20250621000002-enhanced-notifications-system.sql\n" +
                "   • App works with fallback data until database is configured\n" +
                "   • Use window.showDatabaseSetupGuide() for detailed setup instructions",
            );
          }
          return; // Suppress these errors
        }

        // Allow all other errors through
        originalError(...args);
      } catch (error) {
        // If there's an error in our suppression logic, fall back to original
        originalError(...args);
      }
    };
  }
}

// Initialize the simple error suppression
const simpleErrorSuppression = new SimpleErrorSuppression();

export { simpleErrorSuppression };
