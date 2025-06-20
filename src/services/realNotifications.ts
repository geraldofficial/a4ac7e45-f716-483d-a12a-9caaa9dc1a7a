import { supabase } from "@/integrations/supabase/client";
import { formatError } from "@/lib/utils";

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

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching notifications:", formatError(error));
      return [];
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
      console.error("Error fetching notification stats:", formatError(error));
      return { total: 0, unread: 0, starred: 0, urgent: 0 };
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("user_notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", notificationId)
        .eq("user_id", this.userId);

      if (error) throw error;
    } catch (error) {
      console.error("Error marking notification as read:", formatError(error));
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

      if (error) throw error;
    } catch (error) {
      console.error(
        "Error marking all notifications as read:",
        formatError(error),
      );
      throw error;
    }
  }

  async toggleStar(notificationId: string, isStarred: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from("user_notifications")
        .update({ is_starred: isStarred })
        .eq("id", notificationId)
        .eq("user_id", this.userId);

      if (error) throw error;
    } catch (error) {
      console.error("Error toggling notification star:", formatError(error));
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("user_notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", this.userId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting notification:", formatError(error));
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

      if (error) throw error;
    } catch (error) {
      console.error("Error creating notification:", formatError(error));
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

      if (error) throw error;
    } catch (error) {
      console.error("Error sending bulk notification:", formatError(error));
      throw error;
    }
  }

  // Subscribe to real-time notification updates
  subscribeToNotifications(
    callback: (notification: UserNotification) => void,
  ): () => void {
    if (!this.userId) return () => {};

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
  }

  // Send sample notifications for testing
  async sendSampleNotifications(): Promise<void> {
    if (!this.userId) return;

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
