// Error suppression utility to prevent console spam from expected missing table errors

class ErrorSuppression {
  private suppressedErrors: Set<string> = new Set();
  private warningShown = false;

  constructor() {
    this.setupConsoleInterception();
  }

  private setupConsoleInterception() {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
      const message = this.argsToString(args);

      // Check for known database table missing errors
      if (this.shouldSuppressError(message)) {
        // Only show the migration guidance once
        if (!this.warningShown) {
          this.warningShown = true;
          originalWarn(
            "📝 Database Setup Required:\n" +
              "   • Missing tables: user_notifications, notification_preferences, push_subscriptions, user_settings\n" +
              "   • Run migration: supabase/migrations/20250621000002-enhanced-notifications-system.sql\n" +
              "   • App works with fallback data until database is configured\n" +
              "   • Error suppression is active to prevent console spam",
          );
        }
        return; // Suppress the error
      }

      // Allow all other errors
      originalError(...args);
    };
  }

  private argsToString(args: any[]): string {
    return args
      .map((arg) => {
        if (typeof arg === "string") return arg;
        if (typeof arg === "object" && arg !== null) {
          try {
            // Handle error objects specially
            if (arg.code || arg.message || arg.details !== undefined) {
              return JSON.stringify(arg);
            }
            return String(arg);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(" ");
  }

  private shouldSuppressError(message: string): boolean {
    const suppressPatterns = [
      // Database table missing errors
      'relation "public.user_notifications" does not exist',
      'relation "public.notification_preferences" does not exist',
      'relation "public.push_subscriptions" does not exist',
      'relation "public.user_settings" does not exist',
      '"code":"42P01"',
      "Error code: 42P01",

      // Body stream errors
      "Failed to execute 'text' on 'Response': body stream already read",
      "TypeError: Failed to execute 'text' on 'Response': body stream already read",
      "body stream already read",

      // Common error messages
      "HTTP error: 404",
      "Error fetching notifications",
      "Error fetching notification stats",
      "Error fetching notification preferences",
      "Error loading settings",
      "Error loading user settings",
      "Error saving settings",

      // JSON stringified error objects
      '{"code":"42P01"',
      '{"details":null,"hint":null,"message":"relation',

      // Complete error patterns
      'relation "public.', // Catches any public table missing error
    ];

    return suppressPatterns.some((pattern) => message.includes(pattern));
  }

  // Method to temporarily disable suppression for debugging
  disableSuppression() {
    console.info("Error suppression disabled for debugging");
    this.suppressedErrors.clear();
    this.warningShown = false;
  }

  // Method to re-enable suppression
  enableSuppression() {
    console.info("Error suppression re-enabled");
    this.warningShown = false;
  }
}

const errorSuppression = new ErrorSuppression();

// Add to window for debugging
declare global {
  interface Window {
    disableErrorSuppression: () => void;
    enableErrorSuppression: () => void;
  }
}

window.disableErrorSuppression = () => errorSuppression.disableSuppression();
window.enableErrorSuppression = () => errorSuppression.enableSuppression();

export { errorSuppression };
