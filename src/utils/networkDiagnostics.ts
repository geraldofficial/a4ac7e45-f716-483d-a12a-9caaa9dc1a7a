export interface NetworkDiagnostics {
  online: boolean;
  supabaseReachable: boolean;
  corsIssues: boolean;
  dnsResolution: boolean;
  lastError?: string;
}

class NetworkDiagnosticsService {
  private diagnostics: NetworkDiagnostics = {
    online: navigator.onLine,
    supabaseReachable: false,
    corsIssues: false,
    dnsResolution: false,
  };

  constructor() {
    // Monitor online/offline status
    window.addEventListener("online", () => {
      this.diagnostics.online = true;
      console.log("🌐 Network back online");
    });

    window.addEventListener("offline", () => {
      this.diagnostics.online = false;
      console.log("📵 Network went offline");
    });
  }

  async runDiagnostics(): Promise<NetworkDiagnostics> {
    console.log("🔍 Running network diagnostics...");

    // Check if browser is online
    this.diagnostics.online = navigator.onLine;

    if (!this.diagnostics.online) {
      console.log("📵 Browser is offline");
      return this.diagnostics;
    }

    // Test Supabase connectivity
    await this.testSupabaseConnection();

    console.log("📊 Network diagnostics results:", this.diagnostics);
    return this.diagnostics;
  }

  private async testSupabaseConnection(): Promise<void> {
    try {
      // Test basic connectivity to Supabase
      const supabaseUrl = "https://ehqlkafauehdpqzrdkia.supabase.co";

      // Try to reach the health endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: "HEAD",
        signal: controller.signal,
        headers: {
          apikey:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocWxrYWZhdWVoZHBxenJka2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzE2NTAsImV4cCI6MjA2NTMwNzY1MH0.b9QDfH7wjlYfwK1-_QhaaRcN1CWIuC3qoHcyh1NYoRU",
        },
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status === 404) {
        // 404 is expected for this endpoint, but means we can reach Supabase
        this.diagnostics.supabaseReachable = true;
        this.diagnostics.dnsResolution = true;
        console.log("✅ Supabase is reachable");
      } else {
        this.diagnostics.supabaseReachable = false;
        this.diagnostics.lastError = `HTTP ${response.status}: ${response.statusText}`;
        console.log(
          "❌ Supabase returned error:",
          response.status,
          response.statusText,
        );
      }
    } catch (error: any) {
      this.diagnostics.supabaseReachable = false;

      if (error.name === "AbortError") {
        this.diagnostics.lastError = "Connection timeout";
        console.log("⏱️ Supabase connection timeout");
      } else if (error.message.includes("CORS")) {
        this.diagnostics.corsIssues = true;
        this.diagnostics.lastError = "CORS policy error";
        console.log("🔒 CORS issues detected");
      } else if (
        error.message.includes("Failed to fetch") ||
        error.name === "NetworkError"
      ) {
        this.diagnostics.dnsResolution = false;
        this.diagnostics.lastError = "Network/DNS error";
        console.log("🌐 Network or DNS resolution error");
      } else {
        this.diagnostics.lastError = error.message;
        console.log("❌ Unknown connection error:", error.message);
      }
    }
  }

  getDiagnostics(): NetworkDiagnostics {
    return { ...this.diagnostics };
  }

  getRecommendations(): string[] {
    const recommendations: string[] = [];

    if (!this.diagnostics.online) {
      recommendations.push("Check your internet connection");
    }

    if (!this.diagnostics.supabaseReachable) {
      if (!this.diagnostics.dnsResolution) {
        recommendations.push(
          "Check DNS settings or try using a different network",
        );
      }

      if (this.diagnostics.corsIssues) {
        recommendations.push(
          "CORS issues detected - check Supabase project configuration",
        );
      }

      recommendations.push("Verify Supabase project is active and accessible");
    }

    if (this.diagnostics.lastError?.includes("timeout")) {
      recommendations.push(
        "Connection is slow - try refreshing or check network stability",
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("Network connectivity appears normal");
    }

    return recommendations;
  }
}

export const networkDiagnostics = new NetworkDiagnosticsService();

// Global debug functions
declare global {
  interface Window {
    debugNetwork: () => Promise<void>;
    getNetworkStatus: () => NetworkDiagnostics;
  }
}

window.debugNetwork = async () => {
  const results = await networkDiagnostics.runDiagnostics();
  const recommendations = networkDiagnostics.getRecommendations();

  console.group("🔍 Network Diagnostics Report");
  console.log("📊 Results:", results);
  console.log("💡 Recommendations:", recommendations);
  console.groupEnd();

  return results;
};

window.getNetworkStatus = () => networkDiagnostics.getDiagnostics();
