import { supabase } from "@/integrations/supabase/client";

interface MigrationStatus {
  hasUserNotifications: boolean;
  hasNotificationPreferences: boolean;
  hasPushSubscriptions: boolean;
  migrationNeeded: boolean;
}

class MigrationRunner {
  private migrationStatus: MigrationStatus = {
    hasUserNotifications: false,
    hasNotificationPreferences: false,
    hasPushSubscriptions: false,
    migrationNeeded: true,
  };

  async checkTablesExist(): Promise<MigrationStatus> {
    try {
      // Check if user_notifications table exists
      const { error: notificationsError } = await supabase
        .from("user_notifications")
        .select("id")
        .limit(1);

      this.migrationStatus.hasUserNotifications =
        !notificationsError || notificationsError.code !== "42P01";

      // Check if notification_preferences table exists
      const { error: preferencesError } = await supabase
        .from("notification_preferences")
        .select("id")
        .limit(1);

      this.migrationStatus.hasNotificationPreferences =
        !preferencesError || preferencesError.code !== "42P01";

      // Check if push_subscriptions table exists
      const { error: subscriptionsError } = await supabase
        .from("push_subscriptions")
        .select("id")
        .limit(1);

      this.migrationStatus.hasPushSubscriptions =
        !subscriptionsError || subscriptionsError.code !== "42P01";

      this.migrationStatus.migrationNeeded = !(
        this.migrationStatus.hasUserNotifications &&
        this.migrationStatus.hasNotificationPreferences &&
        this.migrationStatus.hasPushSubscriptions
      );

      console.log("📊 Migration status:", this.migrationStatus);

      if (this.migrationStatus.migrationNeeded) {
        console.info(
          "📝 Notification system tables are missing. To enable full functionality, run the database migration: 20250621000002-enhanced-notifications-system.sql",
        );
      }

      return this.migrationStatus;
    } catch (error) {
      console.warn(
        "Could not check table existence:",
        error instanceof Error ? error.message : String(error),
      );
      return this.migrationStatus;
    }
  }

  getStatus(): MigrationStatus {
    return { ...this.migrationStatus };
  }

  async createBasicTables(): Promise<boolean> {
    try {
      console.log("🔧 Attempting to create basic notification tables...");

      // Create basic user_notifications table
      if (!this.migrationStatus.hasUserNotifications) {
        await this.createUserNotificationsTable();
      }

      // Create basic notification_preferences table
      if (!this.migrationStatus.hasNotificationPreferences) {
        await this.createNotificationPreferencesTable();
      }

      // Create basic push_subscriptions table
      if (!this.migrationStatus.hasPushSubscriptions) {
        await this.createPushSubscriptionsTable();
      }

      console.log("✅ Basic notification tables created successfully");
      return true;
    } catch (error) {
      console.error(
        "❌ Failed to create basic tables:",
        error instanceof Error ? error.message : String(error),
      );
      return false;
    }
  }

  private async createUserNotificationsTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS user_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        priority TEXT DEFAULT 'medium',
        is_read BOOLEAN DEFAULT FALSE,
        is_starred BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP WITH TIME ZONE,
        starred_at TIMESTAMP WITH TIME ZONE,
        action_url TEXT,
        image_url TEXT,
        actions JSONB,
        metadata JSONB,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- RLS Policies
      ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

      CREATE POLICY IF NOT EXISTS "Users can view their own notifications" ON user_notifications
        FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "Users can update their own notifications" ON user_notifications
        FOR UPDATE USING (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "Users can delete their own notifications" ON user_notifications
        FOR DELETE USING (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "System can insert notifications" ON user_notifications
        FOR INSERT WITH CHECK (true);

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at DESC);
    `;

    await this.executeSql(sql);
  }

  private async createNotificationPreferencesTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        email_notifications BOOLEAN DEFAULT TRUE,
        push_notifications BOOLEAN DEFAULT TRUE,
        watch_party_invites BOOLEAN DEFAULT TRUE,
        friend_requests BOOLEAN DEFAULT TRUE,
        new_content BOOLEAN DEFAULT TRUE,
        system_updates BOOLEAN DEFAULT TRUE,
        marketing BOOLEAN DEFAULT FALSE,
        quiet_hours_enabled BOOLEAN DEFAULT FALSE,
        quiet_hours_start TIME DEFAULT '22:00',
        quiet_hours_end TIME DEFAULT '08:00',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- RLS Policies
      ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

      CREATE POLICY IF NOT EXISTS "Users can view their own preferences" ON notification_preferences
        FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "Users can update their own preferences" ON notification_preferences
        FOR UPDATE USING (auth.uid() = user_id);

      CREATE POLICY IF NOT EXISTS "Users can insert their own preferences" ON notification_preferences
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    `;

    await this.executeSql(sql);
  }

  private async createPushSubscriptionsTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        endpoint TEXT NOT NULL,
        keys JSONB NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, endpoint)
      );

      -- RLS Policies
      ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

      CREATE POLICY IF NOT EXISTS "Users can manage their own push subscriptions" ON push_subscriptions
        FOR ALL USING (auth.uid() = user_id);
    `;

    await this.executeSql(sql);
  }

  private async executeSql(sql: string): Promise<void> {
    const { error } = await supabase.rpc("exec_sql", { sql });
    if (error) {
      throw new Error(`SQL execution failed: ${error.message}`);
    }
  }
}

export const migrationRunner = new MigrationRunner();

// Add to window for debugging
declare global {
  interface Window {
    checkNotificationTables: () => Promise<MigrationStatus>;
    createNotificationTables: () => Promise<boolean>;
  }
}

window.checkNotificationTables = () => migrationRunner.checkTablesExist();
window.createNotificationTables = () => migrationRunner.createBasicTables();
