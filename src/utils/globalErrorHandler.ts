import { toast } from "sonner";
import { networkDiagnostics } from "./networkDiagnostics";

class GlobalErrorHandler {
  private errorCounts: Map<string, number> = new Map();
  private lastErrorTime: Map<string, number> = new Map();
  private readonly THROTTLE_TIME = 5000; // 5 seconds
  private readonly MAX_ERRORS_PER_TYPE = 3;

  constructor() {
    this.setupGlobalHandlers();
  }

  private setupGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.handleError(event.reason, "Unhandled Promise");
    });

    // Handle general JavaScript errors
    window.addEventListener("error", (event) => {
      this.handleError(event.error, "JavaScript Error");
    });

    // Intercept fetch errors globally
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        // Reset error count on successful fetch
        if (response.ok) {
          this.errorCounts.clear();
        }

        return response;
      } catch (error) {
        this.handleFetchError(error, args[0]);
        throw error;
      }
    };
  }

  private async handleFetchError(error: any, url: string | Request) {
    const urlString = typeof url === "string" ? url : url.url;

    // Check if this is a Supabase request
    const isSupabaseRequest =
      urlString.includes("supabase.co") || urlString.includes("supabase");

    if (isSupabaseRequest && error.message.includes("Failed to fetch")) {
      await this.handleSupabaseConnectionError();
    }
  }

  private async handleSupabaseConnectionError() {
    const errorKey = "supabase_connection";

    // Throttle error notifications
    const lastTime = this.lastErrorTime.get(errorKey) || 0;
    const now = Date.now();

    if (now - lastTime < this.THROTTLE_TIME) {
      return; // Too soon since last error
    }

    const count = this.errorCounts.get(errorKey) || 0;
    if (count >= this.MAX_ERRORS_PER_TYPE) {
      return; // Too many errors of this type
    }

    this.errorCounts.set(errorKey, count + 1);
    this.lastErrorTime.set(errorKey, now);

    // Run diagnostics
    const diagnostics = await networkDiagnostics.runDiagnostics();
    const recommendations = networkDiagnostics.getRecommendations();

    // Show user-friendly error message
    if (!diagnostics.online) {
      toast.error("You're offline", {
        description: "Check your internet connection and try again.",
        duration: 5000,
      });
    } else if (!diagnostics.supabaseReachable) {
      toast.error("Connection issue", {
        description:
          "Having trouble connecting to the server. Some features may not work properly.",
        duration: 5000,
        action: {
          label: "Retry",
          onClick: () => window.location.reload(),
        },
      });
    } else {
      toast.warning("Slow connection", {
        description:
          "The connection is slower than usual. Some features may be delayed.",
        duration: 3000,
      });
    }

    // Log detailed info for developers
    console.group("🔍 Connection Error Details");
    console.log("Error count for this type:", count + 1);
    console.log("Diagnostics:", diagnostics);
    console.log("Recommendations:", recommendations);
    console.log("To run manual diagnostics, use: window.debugNetwork()");
    console.groupEnd();
  }

  private handleError(error: any, context: string) {
    // Filter out fetch errors (handled separately)
    if (error && error.message && error.message.includes("Failed to fetch")) {
      return;
    }

    // Log other errors for debugging
    console.warn(`${context}:`, error);
  }

  // Method to manually reset error counts (useful for testing)
  resetErrorCounts() {
    this.errorCounts.clear();
    this.lastErrorTime.clear();
    console.log("Error counts reset");
  }
}

// Initialize global error handler
export const globalErrorHandler = new GlobalErrorHandler();

// Add to window for debugging
declare global {
  interface Window {
    resetErrorCounts: () => void;
  }
}

window.resetErrorCounts = () => globalErrorHandler.resetErrorCounts();
