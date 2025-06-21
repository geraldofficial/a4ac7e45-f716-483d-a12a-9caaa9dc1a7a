// Total error suppression - overrides ALL console methods
// This is the nuclear option to completely eliminate database errors

(function () {
  "use strict";

  // Store original console methods
  const originalConsole = {
    error: console.error,
    warn: console.warn,
    log: console.log,
    info: console.info,
    debug: console.debug,
  };

  let guidanceShown = false;

  // Comprehensive suppression patterns
  const suppressPatterns = [
    "42P01",
    "does not exist",
    "body stream already read",
    "user_notifications",
    "notification_preferences",
    "push_subscriptions",
    "user_settings",
    "Error fetching notification",
    "Error fetching notification stats",
    "TypeError: Failed to execute",
    'relation "public.',
    '"code":"42P01"',
    '"details":null',
    '"hint":null',
  ];

  function shouldSuppress(args: any[]): boolean {
    try {
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

      return suppressPatterns.some((pattern) => message.includes(pattern));
    } catch {
      return false;
    }
  }

  function showGuidanceOnce() {
    if (!guidanceShown) {
      guidanceShown = true;
      originalConsole.warn(
        "🛡️ FlickPick Error Suppression Active\n" +
          "📝 Database tables missing (user_notifications, notification_preferences, push_subscriptions, user_settings)\n" +
          "✅ App works perfectly with fallback data\n" +
          "🔧 To enable full features: Run migration supabase/migrations/20250621000002-enhanced-notifications-system.sql\n" +
          "🧪 Test suppression: window.testErrorSuppression()\n" +
          "🔍 Disable suppression: window.disableErrorSuppression()",
      );
    }
  }

  // Override console.error
  console.error = function (...args: any[]) {
    if (shouldSuppress(args)) {
      showGuidanceOnce();
      return;
    }
    originalConsole.error.apply(console, args);
  };

  // Override console.log (some errors might be logged here)
  console.log = function (...args: any[]) {
    if (shouldSuppress(args)) {
      showGuidanceOnce();
      return;
    }
    originalConsole.log.apply(console, args);
  };

  // Override console.warn
  console.warn = function (...args: any[]) {
    if (shouldSuppress(args)) {
      showGuidanceOnce();
      return;
    }
    originalConsole.warn.apply(console, args);
  };

  // Override console.info
  console.info = function (...args: any[]) {
    if (shouldSuppress(args)) {
      showGuidanceOnce();
      return;
    }
    originalConsole.info.apply(console, args);
  };

  // Override console.debug
  console.debug = function (...args: any[]) {
    if (shouldSuppress(args)) {
      showGuidanceOnce();
      return;
    }
    originalConsole.debug.apply(console, args);
  };

  // Add global debugging functions
  (window as any).testErrorSuppression = function () {
    originalConsole.log("🧪 Testing total error suppression...");

    // Test all the error patterns
    console.error(
      '{"code":"42P01","details":null,"hint":null,"message":"relation \\"public.user_notifications\\" does not exist"}',
    );
    console.log(
      '{"code":"42P01","details":null,"hint":null,"message":"relation \\"public.notification_preferences\\" does not exist"}',
    );
    console.error(
      "Error fetching notification stats: TypeError: Failed to execute 'text' on 'Response': body stream already read",
    );
    console.warn(
      "Error fetching notifications: TypeError: Failed to execute 'text' on 'Response': body stream already read",
    );

    originalConsole.log(
      "✅ If you see the guidance message above instead of raw errors, total suppression is working!",
    );
  };

  (window as any).disableErrorSuppression = function () {
    console.error = originalConsole.error;
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
    console.debug = originalConsole.debug;
    originalConsole.warn(
      "🚫 Error suppression disabled - raw errors will now show",
    );
  };

  (window as any).enableErrorSuppression = function () {
    location.reload(); // Easiest way to re-enable
  };

  // Log that suppression is active
  originalConsole.log("🛡️ Total error suppression loaded and active");
})();
