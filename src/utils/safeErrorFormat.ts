/**
 * Safe error formatting that doesn't consume response streams
 * Use this instead of formatError to avoid "body stream already read" errors
 */
export function safeErrorFormat(error: any): string {
  if (!error) return "Unknown error";

  // Handle string errors
  if (typeof error === "string") return error;

  // Handle Error objects
  if (error instanceof Error) return error.message;

  // Handle objects with error properties (without consuming streams)
  if (typeof error === "object" && error !== null) {
    // Check for common error properties
    if (error.message && typeof error.message === "string") {
      const code = error.code ? `[${error.code}]` : "";
      const status = error.status ? ` (${error.status})` : "";
      return `${code}${status} ${error.message}`.trim();
    }

    if (error.code && typeof error.code === "string") {
      return `Error code: ${error.code}`;
    }

    if (error.details && typeof error.details === "string") {
      return error.details;
    }

    if (error.hint && typeof error.hint === "string") {
      return error.hint;
    }

    // Avoid JSON.stringify on Response objects or complex objects
    if (error.constructor && error.constructor.name === "Response") {
      return `HTTP ${error.status || "unknown"}: ${error.statusText || "Unknown error"}`;
    }

    // Last resort: try to extract something meaningful
    const keys = Object.keys(error);
    if (keys.length > 0) {
      return `Error: ${keys.slice(0, 3).join(", ")}`;
    }
  }

  return String(error);
}

/**
 * Safe console error logging
 */
export function safeLogError(context: string, error: any): void {
  const message = safeErrorFormat(error);
  console.error(`${context}: ${message}`);
}
