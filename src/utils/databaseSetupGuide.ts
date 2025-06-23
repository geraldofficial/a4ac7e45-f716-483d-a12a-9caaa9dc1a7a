// Database Setup Guide for FlickPick
// This utility provides guidance for setting up the missing database tables

export const databaseSetupGuide = {
  missingTables: [
    "user_notifications",
    "notification_preferences",
    "push_subscriptions",
    "user_settings",
  ],

  migrationFile:
    "supabase/migrations/20250621000002-enhanced-notifications-system.sql",

  getSetupInstructions: () => {
    return {
      overview:
        "FlickPick is running with fallback data because database tables are missing.",

      instructions: {
        supabaseCLI: [
          "1. Install Supabase CLI: npm install -g supabase",
          "2. Start local Supabase: supabase start",
          "3. Apply migrations: supabase db reset",
          "4. Or run specific migration: supabase db push",
        ],

        supabaseDashboard: [
          "1. Open your Supabase project dashboard",
          "2. Go to SQL Editor",
          "3. Copy and paste the migration file content",
          "4. Execute the SQL script",
        ],

        dockerSupabase: [
          "1. Ensure Docker is running",
          "2. Run: cd your-project && supabase start",
          "3. Wait for containers to start",
          "4. Run: supabase db reset",
        ],
      },

      fallbackBehavior: {
        notifications: "Using sample notifications for demo",
        preferences: "Using localStorage for settings",
        userSettings: "Using browser storage as fallback",
        pushSubscriptions: "Push notifications disabled until DB setup",
      },

      troubleshooting: {
        dockerIssues: "If Docker issues persist, try: docker system prune -f",
        permissionIssues: "Ensure proper file permissions for migration files",
        networkIssues: "Check firewall settings for local Supabase ports",
      },
    };
  },

  checkTableExists: async (tableName: string): Promise<boolean> => {
    try {
      // Use static import to avoid dynamic import issues
      const supabaseModule = await import("@/integrations/supabase/client");
      const { error } = await supabaseModule.supabase
        .from(tableName)
        .select("*")
        .limit(1);

      return !error || error.code !== "42P01";
    } catch {
      return false;
    }
  },

  runTableCheck: async () => {
    const results: Record<string, boolean> = {};

    for (const table of databaseSetupGuide.missingTables) {
      results[table] = await databaseSetupGuide.checkTableExists(table);
    }

    return results;
  },

  displaySetupGuide: () => {
    const guide = databaseSetupGuide.getSetupInstructions();

    console.group("🗄️ Database Setup Guide");
    console.log("📖", guide.overview);

    console.group("��� Setup Instructions");
    console.group("🔧 Using Supabase CLI (Recommended)");
    guide.instructions.supabaseCLI.forEach((step) => console.log(step));
    console.groupEnd();

    console.group("🌐 Using Supabase Dashboard");
    guide.instructions.supabaseDashboard.forEach((step) => console.log(step));
    console.groupEnd();

    console.group("🐳 Using Docker + Supabase");
    guide.instructions.dockerSupabase.forEach((step) => console.log(step));
    console.groupEnd();
    console.groupEnd();

    console.group("🔄 Current Fallback Behavior");
    Object.entries(guide.fallbackBehavior).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    console.groupEnd();

    console.group("🔧 Troubleshooting");
    Object.entries(guide.troubleshooting).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    console.groupEnd();

    console.groupEnd();
  },

  generateMigrationCommand: () => {
    return "supabase db reset";
  },
};

// Add debug functions to window for easy access
declare global {
  interface Window {
    showDatabaseSetupGuide: () => void;
    checkDatabaseTables: () => Promise<void>;
  }
}

if (typeof window !== "undefined") {
  window.showDatabaseSetupGuide = () => {
    databaseSetupGuide.displaySetupGuide();
  };

  window.checkDatabaseTables = async () => {
    console.log("🔍 Checking database tables...");
    const results = await databaseSetupGuide.runTableCheck();

    console.group("📊 Database Table Status");
    Object.entries(results).forEach(([table, exists]) => {
      console.log(
        `${exists ? "✅" : "❌"} ${table}: ${exists ? "EXISTS" : "MISSING"}`,
      );
    });
    console.groupEnd();

    const missingCount = Object.values(results).filter(
      (exists) => !exists,
    ).length;
    if (missingCount > 0) {
      console.log(
        `\n🚨 ${missingCount} tables missing. Run window.showDatabaseSetupGuide() for help.`,
      );
    } else {
      console.log("\n🎉 All required tables exist!");
    }
  };
}

export default databaseSetupGuide;
