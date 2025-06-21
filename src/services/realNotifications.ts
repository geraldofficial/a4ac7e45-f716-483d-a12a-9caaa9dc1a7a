import { supabase } from "@/integrations/supabase/client";
import { safeLogError } from "@/utils/safeErrorFormat";

export interface UserNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type:
    | "info"
    | "warning"
    | "success"
    | "error"
    | "announcement"
    | "update"
    | "promotion";
  priority: "low" | "medium" | "high" | "urgent";
  is_read: boolean;
  is_starred: boolean;
  metadata?: Record<string, any>;
  action_url?: string;
  expires_at?: string;
  created_at: string;
  read_at?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  starred: number;
  urgent: number;
}

class RealNotificationsService {
  private userId: string | null = null;

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  async getNotifications(limit = 50): Promise<UserNotification[]> {
    if (!this.userId) return [];

    try {
      const { data, error } = await supabase
        .from("user_notifications")
        .select("*")
        .eq("user_id", this.userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        // If table doesn't exist, return empty array and log info
        if (error.code === "42P01") {
          console.info(
            "User notifications table not yet created. Using fallback.",
          );
          return this.getFallbackNotifications();
        }
        throw error;
      }
      return data || [];
    } catch (error) {
      safeLogError("Error fetching notifications", error);
      // Return fallback notifications if there's any error
      return this.getFallbackNotifications();
    }
  }

  async getNotificationStats(): Promise<NotificationStats> {
    if (!this.userId) {
      return { total: 0, unread: 0, starred: 0, urgent: 0 };
    }

    try {
      const [totalResult, unreadResult, starredResult, urgentResult] =
        await Promise.all([
          supabase
            .from("user_notifications")
            .select("id", { count: "exact" })
            .eq("user_id", this.userId),

          supabase
            .from("user_notifications")
            .select("id", { count: "exact" })
            .eq("user_id", this.userId)
            .eq("is_read", false),

          supabase
            .from("user_notifications")
            .select("id", { count: "exact" })
            .eq("user_id", this.userId)
            .eq("is_starred", true),

          supabase
            .from("user_notifications")
            .select("id", { count: "exact" })
            .eq("user_id", this.userId)
            .eq("priority", "urgent")
            .eq("is_read", false),
        ]);

      return {
        total: totalResult.count || 0,
        unread: unreadResult.count || 0,
        starred: starredResult.count || 0,
        urgent: urgentResult.count || 0,
      };
    } catch (error) {
      // If table doesn't exist, return fallback stats
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "42P01"
      ) {
        console.info(
          "User notifications table not yet created. Using fallback stats.",
        );
        const fallbackNotifications = this.getFallbackNotifications();
        return {
          total: fallbackNotifications.length,
          unread: fallbackNotifications.filter((n) => !n.is_read).length,
          starred: fallbackNotifications.filter((n) => n.is_starred).length,
          urgent: fallbackNotifications.filter(
            (n) => n.priority === "urgent" && !n.is_read,
          ).length,
        };
      }
      safeLogError("Error fetching notification stats", error);
      return { total: 0, unread: 0, starred: 0, urgent: 0 };
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    // Handle fallback notifications that don't exist in database
    if (notificationId.startsWith("fallback-")) {
      console.info(
        `Marking fallback notification ${notificationId} as read (client-side only)`,
      );
      return;
    }

    try {
      const { error } = await supabase
        .from("user_notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", notificationId)
        .eq("user_id", this.userId);

      if (error) {
        // If table doesn't exist, just log and continue
        if (error.code === "42P01") {
          console.info(
            "User notifications table not yet created. Cannot mark as read.",
          );
          return;
        }
        throw error;
      }
    } catch (error) {
      const errorMessage = formatError(error);
      console.error("Error marking notification as read:", errorMessage);
      // Don't throw error for missing table, just log it
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "42P01"
      ) {
        return;
      }
      // Don't throw error for operations on fallback notifications
      if (errorMessage.includes("fallback") || errorMessage.includes("42P01")) {
        return;
      }
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    if (!this.userId) return;

    try {
      const { error } = await supabase
        .from("user_notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("user_id", this.userId)
        .eq("is_read", false);

      if (error) {
        // If table doesn't exist, just log and continue
        if (error.code === "42P01") {
          console.info(
            "User notifications table not yet created. Marking fallback notifications as read (client-side only).",
          );
          return;
        }
        throw error;
      }
    } catch (error) {
      const errorMessage = formatError(error);
      console.error("Error marking all notifications as read:", errorMessage);
      // Don't throw error for missing table, just log it
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "42P01"
      ) {
        console.info(
          "Fallback: marking all notifications as read (client-side only).",
        );
        return;
      }
      throw error;
    }
  }

  async toggleStar(notificationId: string, isStarred: boolean): Promise<void> {
    // Handle fallback notifications that don't exist in database
    if (notificationId.startsWith("fallback-")) {
      console.info(
        `Toggling star for fallback notification ${notificationId} (client-side only)`,
      );
      return;
    }

    try {
      const { error } = await supabase
        .from("user_notifications")
        .update({ is_starred: isStarred })
        .eq("id", notificationId)
        .eq("user_id", this.userId);

      if (error) {
        // If table doesn't exist, just log and continue
        if (error.code === "42P01") {
          console.info(
            "User notifications table not yet created. Cannot toggle star.",
          );
          return;
        }
        throw error;
      }
    } catch (error) {
      const errorMessage = formatError(error);
      console.error("Error toggling notification star:", errorMessage);
      // Don't throw error for missing table, just log it
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "42P01"
      ) {
        return;
      }
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    // Handle fallback notifications that don't exist in database
    if (notificationId.startsWith("fallback-")) {
      console.info(
        `Deleting fallback notification ${notificationId} (client-side only)`,
      );
      return;
    }

    try {
      const { error } = await supabase
        .from("user_notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", this.userId);

      if (error) {
        // If table doesn't exist, just log and continue
        if (error.code === "42P01") {
          console.info(
            "User notifications table not yet created. Cannot delete notification.",
          );
          return;
        }
        throw error;
      }
    } catch (error) {
      const errorMessage = formatError(error);
      console.error("Error deleting notification:", errorMessage);
      // Don't throw error for missing table, just log it
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "42P01"
      ) {
        return;
      }
      throw error;
    }
  }

  async createNotification(
    notification: Omit<
      UserNotification,
      "id" | "created_at" | "is_read" | "is_starred"
    >,
  ): Promise<void> {
    try {
      const { error } = await supabase.from("user_notifications").insert({
        ...notification,
        is_read: false,
        is_starred: false,
      });

      if (error) {
        // If table doesn't exist, just log and continue
        if (error.code === "42P01") {
          console.info(
            "User notifications table not yet created. Cannot create notification.",
          );
          return;
        }
        throw error;
      }
    } catch (error) {
      // Don't log or throw error for missing table, just handle gracefully
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "42P01"
      ) {
        console.info(
          "User notifications table not yet created. Cannot create notification.",
        );
        return;
      }

      // Only log meaningful errors
      if (error) {
        const errorMessage = formatError(error);
        if (
          errorMessage &&
          errorMessage !== "Unknown error" &&
          errorMessage !== "{}"
        ) {
          console.error("Error creating notification:", errorMessage);
        }
      }
      throw error;
    }
  }

  // Admin function to send notifications to multiple users
  async sendBulkNotification(
    userIds: string[],
    notification: Omit<
      UserNotification,
      "id" | "user_id" | "created_at" | "is_read" | "is_starred"
    >,
  ): Promise<void> {
    try {
      const notifications = userIds.map((userId) => ({
        ...notification,
        user_id: userId,
        is_read: false,
        is_starred: false,
      }));

      const { error } = await supabase
        .from("user_notifications")
        .insert(notifications);

      if (error) {
        // If table doesn't exist, just log and continue
        if (error.code === "42P01") {
          console.info(
            "User notifications table not yet created. Cannot send bulk notification.",
          );
          return;
        }
        throw error;
      }
    } catch (error) {
      // Don't log or throw error for missing table, just handle gracefully
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "42P01"
      ) {
        console.info(
          "User notifications table not yet created. Cannot send bulk notification.",
        );
        return;
      }

      // Only log meaningful errors
      if (error) {
        const errorMessage = formatError(error);
        if (
          errorMessage &&
          errorMessage !== "Unknown error" &&
          errorMessage !== "{}"
        ) {
          console.error("Error sending bulk notification:", errorMessage);
        }
      }
      throw error;
    }
  }

  // Subscribe to real-time notification updates
  subscribeToNotifications(
    callback: (notification: UserNotification) => void,
  ): () => void {
    if (!this.userId) return () => {};

    try {
      const channel = supabase
        .channel(`user_notifications_${this.userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "user_notifications",
            filter: `user_id=eq.${this.userId}`,
          },
          (payload) => {
            if (payload.new) {
              callback(payload.new as UserNotification);
            }
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.warn(
        "Could not subscribe to notifications - table may not exist:",
        error,
      );
      return () => {};
    }
  }

  // Fallback notifications when database table doesn't exist
  private getFallbackNotifications(): UserNotification[] {
    if (!this.userId) return [];

    return [
      {
        id: "fallback-1",
        user_id: this.userId,
        title: "Welcome to FlickPick! 🎬",
        message:
          "Start exploring amazing movies and TV shows. Create your first watchlist and join the community!",
        type: "success",
        priority: "high",
        is_read: false,
        is_starred: false,
        action_url: "/browse",
        created_at: new Date().toISOString(),
      },
      {
        id: "fallback-2",
        user_id: this.userId,
        title: "New Feature: Watch Parties! 🎉",
        message:
          "Invite friends to watch movies together in real-time. Create or join a watch party now!",
        type: "announcement",
        priority: "medium",
        is_read: false,
        is_starred: false,
        action_url: "/community",
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      },
      {
        id: "fallback-3",
        user_id: this.userId,
        title: "Database Setup Required",
        message:
          "Admin: Run the user notifications migration to enable full notification features.",
        type: "info",
        priority: "low",
        is_read: false,
        is_starred: false,
        created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      },
    ];
  }

  // Send sample notifications for testing
  async sendSampleNotifications(): Promise<void> {
    if (!this.userId) return;

    // First check if the table exists by trying a simple query
    try {
      const { error: testError } = await supabase
        .from("user_notifications")
        .select("id")
        .limit(1);

      if (testError && testError.code === "42P01") {
        console.info(
          "User notifications table not yet created. Cannot send sample notifications. Using fallback notifications instead.",
        );
        return;
      }
    } catch (error) {
      console.info(
        "User notifications table not accessible. Cannot send sample notifications. Using fallback notifications instead.",
      );
      return;
    }

    const sampleNotifications = [
      {
        user_id: this.userId,
        title: "Welcome to FlickPick!",
        message:
          "Start exploring amazing movies and TV shows. Create your first watchlist!",
        type: "success" as const,
        priority: "medium" as const,
        action_url: "/browse",
      },
      {
        user_id: this.userId,
        title: "New Feature Available",
        message:
          "Watch parties are now live! Invite friends to watch movies together.",
        type: "announcement" as const,
        priority: "high" as const,
        action_url: "/community",
      },
      {
        user_id: this.userId,
        title: "Trending Now",
        message: "Check out the most popular movies this week.",
        type: "info" as const,
        priority: "low" as const,
        action_url: "/trending",
      },
    ];

    for (const notification of sampleNotifications) {
      await this.createNotification(notification);
    }
  }
}

export const realNotificationsService = new RealNotificationsService();
