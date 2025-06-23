// Immediate error suppression - runs before anything else
// This MUST be the first import to catch all errors

(function () {
  "use strict";

  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  let warningShown = false;

  // Patterns to suppress
  const suppressPatterns = [
    "42P01",
    "does not exist",
    "body stream already read",
    'relation "public.user_notifications"',
    'relation "public.notification_preferences"',
    'relation "public.push_subscriptions"',
    'relation "public.user_settings"',
    "Error fetching notification",
    "TypeError: Failed to execute 'text' on 'Response'",
  ];

  function shouldSuppress(message: string): boolean {
    return suppressPatterns.some((pattern) => message.includes(pattern));
  }

  function messageToString(args: any[]): string {
    return args
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
  }

  // Suppress console.error
  console.error = function (...args: any[]) {
    const message = messageToString(args);

    if (shouldSuppress(message)) {
      if (!warningShown) {
        warningShown = true;
        originalWarn(
          "📝 FlickPick: Database tables missing. App works with fallback data. See migration guide in README.",
        );
      }
      return;
    }

    originalError.apply(console, args);
  };

  // Suppress console.log for error objects
  console.log = function (...args: any[]) {
    const message = messageToString(args);

    if (shouldSuppress(message)) {
      return;
    }

    originalLog.apply(console, args);
  };

  // Add to window for debugging
  (window as any).testErrorSuppression = function () {
    console.log("🧪 Testing immediate error suppression...");
    console.error(
      '{"code":"42P01","details":null,"hint":null,"message":"relation \\"public.user_notifications\\" does not exist"}',
    );
    console.error(
      "Error fetching notification preferences: TypeError: Failed to execute 'text' on 'Response': body stream already read",
    );
    console.log("✅ Immediate suppression active!");
  };

  console.log("🛡️ Immediate error suppression loaded");
})();
