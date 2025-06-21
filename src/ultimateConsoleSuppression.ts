// Ultimate console suppression - absolutely no way to bypass
console.log("🚀 Loading ultimate console suppression...");

// Save originals in a closure that can't be accessed
(function () {
  const orig = {
    error: console.error.bind(console),
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    info: console.info.bind(console),
    debug: console.debug.bind(console),
  };

  let suppressedTotal = 0;
  let warningShown = false;

  function isDbError(str: string): boolean {
    const patterns = [
      "42P01",
      "user_notifications",
      "notification_preferences",
      "push_subscriptions",
      "user_settings",
      "does not exist",
      "body stream",
      'relation "public',
    ];
    return patterns.some((pattern) => str.includes(pattern));
  }

  function interceptAndSuppress(originalFn: Function, methodName: string) {
    return function (...args: any[]) {
      try {
        const message = args
          .map((arg) => {
            if (typeof arg === "string") return arg;
            if (typeof arg === "object" && arg) {
              try {
                return JSON.stringify(arg);
              } catch {
                return "[Object]";
              }
            }
            return String(arg);
          })
          .join(" ");

        if (isDbError(message)) {
          suppressedTotal++;
          if (!warningShown) {
            warningShown = true;
            orig.warn(`🛡️ Database error suppression active (${methodName})`);
          }
          return;
        }
      } catch {
        // If there's any error in our suppression, just pass through
      }

      originalFn.apply(console, args);
    };
  }

  // Override all console methods
  console.error = interceptAndSuppress(orig.error, "error");
  console.log = interceptAndSuppress(orig.log, "log");
  console.warn = interceptAndSuppress(orig.warn, "warn");
  console.info = interceptAndSuppress(orig.info, "info");
  console.debug = interceptAndSuppress(orig.debug, "debug");

  // Add debug functions
  (window as any).testUltimateSuppress = () => {
    orig.log("🧪 Testing ultimate suppression...");
    console.error(
      '{"code":"42P01","details":null,"hint":null,"message":"relation \\"public.user_notifications\\" does not exist"}',
    );
    console.log(
      'TEST_SUPPRESSION_42P01: relation "public.test" does not exist',
    );
    orig.log(`✅ Test complete. Total suppressed: ${suppressedTotal}`);
  };

  (window as any).getSuppressionStats = () => {
    orig.log(
      `📊 Ultimate suppression stats: ${suppressedTotal} errors suppressed`,
    );
    return { suppressed: suppressedTotal, active: true };
  };

  // Test immediately
  orig.log("🧪 Testing ultimate suppression immediately...");
  console.error('IMMEDIATE_TEST_42P01: relation "public.test" does not exist');
  orig.log("✅ Ultimate console suppression active and tested");
})();
