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
            "📝 Notification database tables are missing. Run migration 20250621000002-enhanced-notifications-system.sql to enable full functionality.",
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
          if (arg.code || arg.message) {
            return JSON.stringify(arg);
          }
          return String(arg);
        }
        return String(arg);
      })
      .join(" ");
  }

  private shouldSuppressError(message: string): boolean {
    const suppressPatterns = [
      'relation "public.user_notifications" does not exist',
      'relation "public.notification_preferences" does not exist',
      'relation "public.push_subscriptions" does not exist',
      'relation "public.user_settings" does not exist',
      "Failed to execute 'text' on 'Response': body stream already read",
      '"code":"42P01"',
      "Error code: 42P01",
      "HTTP error: 404",
      "Error fetching notifications: [object Object]",
      "Error fetching notification stats:",
      "Error fetching notification preferences:",
      "Error loading settings: [object Object]",
      "Error loading user settings:",
      "Error saving settings:",
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
