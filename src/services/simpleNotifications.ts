import { supabase } from "@/integrations/supabase/client";
import { safeLogError } from "@/utils/safeErrorFormat";

// Simple notification interface - just for admin messages
export interface AdminMessage {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "announcement";
  isRead: boolean;
  created_at: string;
  from_admin: boolean;
}

class SimpleNotificationService {
  private userId: string | null = null;

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  // Get admin messages for the current user
  async getAdminMessages(): Promise<AdminMessage[]> {
    if (!this.userId) return this.getFallbackMessages();

    try {
      const { data, error } = await supabase
        .from("admin_messages")
        .select("*")
        .eq("user_id", this.userId)
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code === "42P01") {
          console.info(
            "Admin messages table not yet created. Using fallback messages.",
          );
          return this.getFallbackMessages();
        }
        throw error;
      }

      return data || [];
    } catch (error) {
      safeLogError("Error fetching admin messages", error);
      return this.getFallbackMessages();
    }
  }

  // Mark message as read
  async markAsRead(messageId: string): Promise<void> {
    if (messageId.startsWith("fallback-")) {
      console.info("Marking fallback message as read (client-side only)");
      return;
    }

    try {
      const { error } = await supabase
        .from("admin_messages")
        .update({ isRead: true })
        .eq("id", messageId)
        .eq("user_id", this.userId);

      if (error && error.code === "42P01") {
        console.info(
          "Admin messages table not yet created. Cannot mark as read.",
        );
        return;
      }

      if (error) throw error;
    } catch (error) {
      safeLogError("Error marking message as read", error);
    }
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    if (!this.userId) return 0;

    try {
      const { data, error } = await supabase
        .from("admin_messages")
        .select("id", { count: "exact" })
        .eq("user_id", this.userId)
        .eq("isRead", false);

      if (error) {
        if (error.code === "42P01") {
          return this.getFallbackMessages().filter((m) => !m.isRead).length;
        }
        throw error;
      }

      return data?.length || 0;
    } catch (error) {
      safeLogError("Error getting unread count", error);
      return 0;
    }
  }

  // Admin function: Send message to specific user
  async sendMessageToUser(
    userId: string,
    title: string,
    message: string,
    type: AdminMessage["type"] = "info",
  ): Promise<void> {
    try {
      const { error } = await supabase.from("admin_messages").insert({
        user_id: userId,
        title,
        message,
        type,
        isRead: false,
        from_admin: true,
      });

      if (error && error.code === "42P01") {
        console.info(
          "Admin messages table not yet created. Cannot send message.",
        );
        return;
      }

      if (error) throw error;
    } catch (error) {
      safeLogError("Error sending admin message", error);
      throw error;
    }
  }

  // Admin function: Send message to all users
  async sendMessageToAllUsers(
    title: string,
    message: string,
    type: AdminMessage["type"] = "info",
  ): Promise<void> {
    try {
      // First get all user IDs
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id");

      if (usersError) {
        if (usersError.code === "42P01") {
          console.info(
            "Profiles table not yet created. Cannot send message to all users.",
          );
          return;
        }
        throw usersError;
      }

      if (!users || users.length === 0) {
        console.info("No users found to send message to.");
        return;
      }

      // Create message for each user
      const messages = users.map((user) => ({
        user_id: user.id,
        title,
        message,
        type,
        isRead: false,
        from_admin: true,
      }));

      const { error } = await supabase.from("admin_messages").insert(messages);

      if (error && error.code === "42P01") {
        console.info(
          "Admin messages table not yet created. Cannot send message to all users.",
        );
        return;
      }

      if (error) throw error;
    } catch (error) {
      safeLogError("Error sending message to all users", error);
      throw error;
    }
  }

  // Subscribe to new admin messages
  subscribeToMessages(callback: (message: AdminMessage) => void): () => void {
    if (!this.userId) return () => {};

    try {
      const channel = supabase
        .channel(`admin_messages_${this.userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "admin_messages",
            filter: `user_id=eq.${this.userId}`,
          },
          (payload) => {
            if (payload.new) {
              callback(payload.new as AdminMessage);
            }
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.warn(
        "Could not subscribe to admin messages - table may not exist:",
        error,
      );
      return () => {};
    }
  }

  private getFallbackMessages(): AdminMessage[] {
    if (!this.userId) return [];

    return [
      {
        id: "fallback-1",
        title: "Welcome to FlickPick! 🎬",
        message:
          "Welcome to FlickPick! We're excited to have you join our community. Start exploring amazing movies and TV shows today.",
        type: "success",
        isRead: false,
        created_at: new Date().toISOString(),
        from_admin: true,
      },
      {
        id: "fallback-2",
        title: "New Features Available",
        message:
          "We've added exciting new features including Watch Parties and improved search functionality. Check them out!",
        type: "announcement",
        isRead: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        from_admin: true,
      },
    ];
  }
}

export const simpleNotificationService = new SimpleNotificationService();
