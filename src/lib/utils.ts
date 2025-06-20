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

  // Handle Supabase error structure
  if (error.message || error.details || error.code) {
    const message =
      error.message || error.details || error.hint || "Unknown error";
    const code = error.code ? `[${error.code}]` : "";
    const status = error.status ? ` (${error.status})` : "";
    return `${code}${status} ${message}`.trim();
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Fallback for other objects
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}
