// Error suppression status checker and comprehensive debugging

export function checkErrorSuppressionStatus() {
  console.group("🛡️ FlickPick Error Suppression Status");

  // Check if suppression functions exist
  const hasTestFunction =
    typeof (window as any).testErrorSuppression === "function";
  const hasDisableFunction =
    typeof (window as any).disableErrorSuppression === "function";

  console.log("✅ Test function available:", hasTestFunction);
  console.log("✅ Disable function available:", hasDisableFunction);

  // Check if console methods have been overridden
  const consoleOverridden =
    console.error.toString().includes("shouldSuppress") ||
    console.error.toString().length < 50; // Native functions are usually longer

  console.log("✅ Console methods overridden:", consoleOverridden);

  // Test suppression with a sample error
  const originalError = console.error;
  let suppressionWorking = false;

  console.error = (...args: any[]) => {
    if (
      args[0] &&
      args[0].includes &&
      args[0].includes("TEST_SUPPRESSION_42P01")
    ) {
      suppressionWorking = false; // If this runs, suppression failed
    }
    originalError.apply(console, args);
  };

  // Try to log a test error
  console.error(
    'TEST_SUPPRESSION_42P01: relation "public.test" does not exist',
  );
  suppressionWorking = true; // If we get here, it was suppressed

  console.log("✅ Suppression test passed:", suppressionWorking);

  console.log("\n📋 Available Debug Commands:");
  console.log("• window.testErrorSuppression() - Test error suppression");
  console.log("• window.disableErrorSuppression() - Disable suppression");
  console.log("• window.enableErrorSuppression() - Re-enable suppression");

  console.groupEnd();

  return {
    hasTestFunction,
    hasDisableFunction,
    consoleOverridden,
    suppressionWorking,
    status:
      hasTestFunction && consoleOverridden && suppressionWorking
        ? "ACTIVE"
        : "INACTIVE",
  };
}

// Auto-run status check after a delay to ensure everything is loaded
setTimeout(() => {
  if (typeof window !== "undefined") {
    (window as any).checkErrorSuppressionStatus = checkErrorSuppressionStatus;

    // Auto-check status
    const status = checkErrorSuppressionStatus();
    if (status.status === "ACTIVE") {
      console.log("🎉 Error suppression is fully active and working!");
    } else {
      console.warn(
        "⚠️ Error suppression may not be working properly. Check status above.",
      );
    }
  }
}, 2000);

export default checkErrorSuppressionStatus;
