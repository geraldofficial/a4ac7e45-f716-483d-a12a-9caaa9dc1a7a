import { supabase } from "./client";
import type { Database } from "./types";

/**
 * Safe wrapper for Supabase operations with enhanced error handling
 */
export class SafeSupabaseClient {
  private static instance: SafeSupabaseClient;
  private retryAttempts = 3;
  private retryDelay = 1000;

  static getInstance(): SafeSupabaseClient {
    if (!SafeSupabaseClient.instance) {
      SafeSupabaseClient.instance = new SafeSupabaseClient();
    }
    return SafeSupabaseClient.instance;
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    context: string,
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        // Don't retry on certain errors
        if (
          error.message?.includes("invalid claim") ||
          error.message?.includes("JWT") ||
          error.message?.includes("No API key found") || // API key errors
          error.code === "42P01" || // Table doesn't exist
          error.code === "42703" // Column doesn't exist
        ) {
          // For API key errors, log and throw immediately
          if (error.message?.includes("No API key found")) {
            console.error("🔑 CRITICAL: API key missing from Supabase request");
            console.error(
              "This indicates a configuration issue with the Supabase client",
            );
          }
          throw error;
        }

        if (attempt < this.retryAttempts) {
          console.warn(
            `${context} failed (attempt ${attempt}/${this.retryAttempts}):`,
            error.message,
          );
          await new Promise((resolve) =>
            setTimeout(resolve, this.retryDelay * attempt),
          );
        }
      }
    }

    throw lastError;
  }

  async safeAuth() {
    return this.withRetry(
      () => supabase.auth.getSession(),
      "Auth session fetch",
    );
  }

  async safeQuery<T = any>(
    tableName: string,
    operation: (table: any) => Promise<T>,
  ): Promise<T> {
    return this.withRetry(
      () => operation(supabase.from(tableName)),
      `Query on ${tableName}`,
    );
  }

  async safeRpc<T = any>(
    functionName: string,
    params?: any,
  ): Promise<{ data: T | null; error: any }> {
    return this.withRetry(
      () => supabase.rpc(functionName, params),
      `RPC call to ${functionName}`,
    );
  }

  // Direct access to the underlying client for advanced operations
  get client() {
    return supabase;
  }
}

export const safeSupabase = SafeSupabaseClient.getInstance();
