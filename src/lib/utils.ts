import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safe error formatter that doesn't consume response streams
 * Handles Supabase errors and general JavaScript errors without body stream issues
 */
export function formatError(error: any): string {
  try {
    if (!error) return "Unknown error";

    // Handle string errors first
    if (typeof error === "string") {
      return error;
    }

    // Handle standard Error objects
    if (error instanceof Error) {
      return error.message || error.toString();
    }

    // Handle Response objects - NEVER try to read the body or call methods that might consume streams
    if (error instanceof Response) {
      return `HTTP ${error.status}: ${error.statusText}`;
    }

    // Handle fetch/network errors safely
    if (
      error.name === "TypeError" ||
      error.name === "NetworkError" ||
      error.name === "AbortError"
    ) {
      return `Network error: ${error.message || "Connection failed"}`;
    }

    // Handle Supabase error objects safely
    if (error && typeof error === "object") {
      // Check for common error properties without trying to read streams
      if (error.code || error.message || error.details) {
        const message =
          error.message || error.details || error.hint || "Unknown error";
        const code = error.code ? `[${error.code}]` : "";
        const status = error.status ? ` (${error.status})` : "";

        // Add helpful context for common database errors
        let helpText = "";
        if (error.code === "42703" && message.includes("does not exist")) {
          helpText = " (Check database schema - column may not exist)";
        } else if (
          error.code === "42P01" &&
          message.includes("does not exist")
        ) {
          helpText =
            " (Check database schema - table may not exist or have different name)";
        }

        return `${code}${status} ${message}${helpText}`.trim();
      }

      // Handle nested error structures safely
      if (error.error && typeof error.error === "object") {
        return formatError(error.error);
      }

      // Try to find any meaningful error properties without consuming streams
      const meaningfulProps = [
        "message",
        "error",
        "description",
        "detail",
        "reason",
        "statusText",
      ];
      for (const prop of meaningfulProps) {
        if (error[prop] && typeof error[prop] === "string") {
          return error[prop];
        }
      }

      // For other objects, safely stringify without consuming streams
      try {
        // Avoid stringifying Response objects or objects with potentially problematic properties
        if (error.constructor && error.constructor.name === "Response") {
          return `Response object: ${error.status || "unknown status"}`;
        }

        // Check if object has methods that might consume streams
        if (error.text || error.json || error.blob || error.arrayBuffer) {
          return "Response-like object (cannot safely read)";
        }

        const jsonStr = JSON.stringify(error);
        return jsonStr.length > 200
          ? jsonStr.substring(0, 200) + "..."
          : jsonStr;
      } catch {
        return "Object error (cannot serialize safely)";
      }
    }

    // Handle objects with toString method
    if (error && typeof error.toString === "function") {
      try {
        const stringified = error.toString();
        if (stringified !== "[object Object]") {
          return stringified;
        }
      } catch {
        // toString failed, continue to fallback
      }
    }

    return String(error);
  } catch {
    return "Error formatting error message";
  }
}
