// Table existence cache - prevents queries to non-existent tables
import { supabase } from "@/integrations/supabase/client";

class TableExistenceCache {
  private cache = new Map<string, boolean>();
  private checking = new Set<string>();

  async exists(tableName: string): Promise<boolean> {
    // Return cached result if we have it
    if (this.cache.has(tableName)) {
      return this.cache.get(tableName)!;
    }

    // If already checking, wait a bit and return false
    if (this.checking.has(tableName)) {
      return false;
    }

    // Check table existence
    this.checking.add(tableName);

    try {
      const { error } = await supabase.from(tableName).select("*").limit(1);

      const exists = !error || error.code !== "42P01";
      this.cache.set(tableName, exists);

      if (!exists) {
        console.info(
          `📋 Table '${tableName}' does not exist - cached for future queries`,
        );
      }

      return exists;
    } catch (error) {
      // On any error, assume table doesn't exist
      this.cache.set(tableName, false);
      return false;
    } finally {
      this.checking.delete(tableName);
    }
  }

  // Mark a table as definitely missing to avoid future checks
  markMissing(tableName: string) {
    this.cache.set(tableName, false);
    console.info(`📋 Table '${tableName}' marked as missing`);
  }

  // Clear cache for a table (if it might have been created)
  clearCache(tableName: string) {
    this.cache.delete(tableName);
  }

  // Get cache status
  getStatus() {
    const entries = Array.from(this.cache.entries());
    return {
      cached: entries.length,
      existing: entries.filter(([, exists]) => exists).length,
      missing: entries.filter(([, exists]) => !exists).length,
      tables: Object.fromEntries(entries),
    };
  }
}

export const tableCache = new TableExistenceCache();

// Mark known missing tables immediately
const KNOWN_MISSING_TABLES = [
  "user_notifications",
  "notification_preferences",
  "push_subscriptions",
  "user_settings",
];
KNOWN_MISSING_TABLES.forEach((table) => tableCache.markMissing(table));

// Add debug function
(window as any).getTableStatus = () => {
  const status = tableCache.getStatus();
  console.table(status.tables);
  return status;
};
