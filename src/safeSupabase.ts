// Safe Supabase wrapper - prevents database errors at the source
import { supabase as originalSupabase } from "@/integrations/supabase/client";

const MISSING_TABLES = [
  "user_notifications",
  "notification_preferences",
  "push_subscriptions",
  "user_settings",
];

// Track which tables are known to be missing
const missingTables = new Set<string>();

// Safe wrapper for Supabase operations
export const safeSupabase = {
  ...originalSupabase,

  from: (tableName: string) => {
    // If we know this table is missing, return a mock implementation
    if (missingTables.has(tableName) || MISSING_TABLES.includes(tableName)) {
      console.info(
        `🛡️ Safe mode: Bypassing query to missing table '${tableName}'`,
      );

      return {
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: null,
                error: { code: "42P01", message: "Table handled safely" },
              }),
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
          limit: () => Promise.resolve({ data: [], error: null }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
            range: () => Promise.resolve({ data: [], error: null }),
          }),
          range: () => Promise.resolve({ data: [], error: null }),
        }),
        insert: () =>
          Promise.resolve({
            data: null,
            error: { code: "42P01", message: "Table handled safely" },
          }),
        update: () => ({
          eq: () =>
            Promise.resolve({
              data: null,
              error: { code: "42P01", message: "Table handled safely" },
            }),
        }),
        upsert: () =>
          Promise.resolve({
            data: null,
            error: { code: "42P01", message: "Table handled safely" },
          }),
        delete: () => ({
          eq: () =>
            Promise.resolve({
              data: null,
              error: { code: "42P01", message: "Table handled safely" },
            }),
        }),
      };
    }

    // For other tables, wrap the original with error handling
    const originalFrom = originalSupabase.from(tableName);

    // Return a proxy that catches 42P01 errors
    return new Proxy(originalFrom, {
      get(target, prop) {
        const original = target[prop as keyof typeof target];
        if (typeof original === "function") {
          return function (...args: any[]) {
            const result = original.apply(target, args);

            // If it's a Promise, catch 42P01 errors
            if (result && typeof result.then === "function") {
              return result.catch((error: any) => {
                if (error && error.code === "42P01") {
                  console.info(
                    `🛡️ Detected missing table '${tableName}', adding to safe mode list`,
                  );
                  missingTables.add(tableName);
                  return { data: null, error };
                }
                throw error;
              });
            }

            return result;
          };
        }
        return original;
      },
    });
  },
};

// Export both versions for flexibility
export { originalSupabase as supabase };
export default safeSupabase;
