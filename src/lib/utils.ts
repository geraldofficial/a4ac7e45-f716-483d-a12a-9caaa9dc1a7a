import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats error objects for better readability and debugging
 * Handles Supabase errors and general JavaScript errors
 */
export function formatError(error: any): string {
  if (!error) return "Unknown error";

  // Handle nested error structures
  if (error.error && typeof error.error === "object") {
    return formatError(error.error);
  }

  // Handle Supabase error structure
  if (error.message || error.details || error.code) {
    const message =
      error.message || error.details || error.hint || "Unknown error";
    const code = error.code ? `[${error.code}]` : "";
    const status = error.status ? ` (${error.status})` : "";

    // Add helpful context for common database errors
    let helpText = "";
    if (error.code === "42703" && message.includes("does not exist")) {
      helpText = " (Check database schema - column may not exist)";
    } else if (error.code === "42P01" && message.includes("does not exist")) {
      helpText =
        " (Check database schema - table may not exist or have different name)";
    }

    return `${code}${status} ${message}${helpText}`.trim();
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message || error.toString();
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Handle objects with toString method
  if (error && typeof error.toString === "function") {
    const stringified = error.toString();
    if (stringified !== "[object Object]") {
      return stringified;
    }
  }

  // Fallback for other objects - try to extract meaningful info
  try {
    if (typeof error === "object" && error !== null) {
      // Try to find any meaningful error properties
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

      // Last resort: JSON stringify but limit size
      const jsonStr = JSON.stringify(error);
      return jsonStr.length > 200 ? jsonStr.substring(0, 200) + "..." : jsonStr;
    }
    return String(error);
  } catch {
    return "Error: Unable to format error message";
  }
}
