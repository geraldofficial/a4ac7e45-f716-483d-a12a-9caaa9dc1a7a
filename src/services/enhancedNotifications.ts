import { supabase } from "@/integrations/supabase/client";
import { safeLogError } from "@/utils/safeErrorFormat";
// import "@/utils/errorSuppression"; // Ensure error suppression is active

// Enhanced notification types
export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  watch_party_invites: boolean;
  friend_requests: boolean;
  new_content: boolean;
  system_updates: boolean;
  marketing: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  variables: string[]; // JSON array of variable names
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduledNotification {
  id: string;
  user_id: string;
  template_id?: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  scheduled_for: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  retry_count: number;
  action_url?: string;
  image_url?: string;
  actions?: NotificationAction[];
  created_at: string;
  updated_at: string;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  url?: string;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface UserNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  is_read: boolean;
  is_starred: boolean;
  read_at?: string;
  starred_at?: string;
  action_url?: string;
  image_url?: string;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
  expires_at?: string;
  created_at: string;
}

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'announcement'
  | 'friend_request'
  | 'watch_party_invite'
  | 'content_recommendation'
  | 'system_update'
  | 'reminder'
  | 'achievement'
  | 'promo';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NotificationStats {
  total: number;
  unread: number;
  starred: number;
  urgent: number;
  by_type: Record<NotificationType, number>;
  by_priority: Record<NotificationPriority, number>;
}

export interface NotificationFilters {
  type?: NotificationType;
  priority?: NotificationPriority;
  is_read?: boolean;
  is_starred?: boolean;
  date_from?: string;
  date_to?: string;
  search?: string;
}

class EnhancedNotificationsService {
  private userId: string | null = null;
  private pushSubscription: PushSubscription | null = null;
  private preferences: NotificationPreferences | null = null;

  setUserId(userId: string | null) {
    this.userId = userId;
    if (userId) {
      this.initializeService();
    }
  }

  private async initializeService() {
    try {
      // Check if tables exist and log status
      const { migrationRunner } = await import("@/utils/migrationRunner");
      await migrationRunner.checkTablesExist();

      this.loadPreferences();
      this.requestPushPermission();
    } catch (error) {
      console.warn("Error initializing notification service:", error instanceof Error ? error.message : String(error));
      // Continue with basic initialization
      this.loadPreferences();
      this.requestPushPermission();
    }
  }

  // === CORE NOTIFICATION OPERATIONS ===

  async getNotifications(
    filters?: NotificationFilters,
    limit = 50,
    offset = 0
  ): Promise<UserNotification[]> {
    if (!this.userId) return this.getFallbackNotifications();

    try {
      let query = supabase
        .from("user_notifications")
        .select("*")
        .eq("user_id", this.userId)
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters) {
        if (filters.type) query = query.eq("type", filters.type);
        if (filters.priority) query = query.eq("priority", filters.priority);
        if (filters.is_read !== undefined) query = query.eq("is_read", filters.is_read);
        if (filters.is_starred !== undefined) query = query.eq("is_starred", filters.is_starred);
        if (filters.date_from) query = query.gte("created_at", filters.date_from);
        if (filters.date_to) query = query.lte("created_at", filters.date_to);
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
        }
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        if (error.code === '42P01') {
          console.info("User notifications table not yet created. Using fallback notifications.");
          return this.getFallbackNotifications();
        }
        throw error;
      }

      return data || [];
    } catch (error) {
      // Handle network errors gracefully
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.warn("❌ Network error fetching notifications. Using fallback notifications.");
        return this.getFallbackNotifications();
      }

      // Use safe error logging to avoid body stream issues
      safeLogError("Error fetching notifications", error);
      return this.getFallbackNotifications();
    }
  }

  async getNotificationStats(): Promise<NotificationStats> {
    if (!this.userId) return this.getFallbackStats();

    try {
      const { data, error } = await supabase
        .from("user_notifications")
        .select("type, priority, is_read, is_starred")
        .eq("user_id", this.userId);

      if (error) {
        if (error.code === '42P01') {
          console.info("User notifications table not yet created. Using fallback stats.");
          return this.getFallbackStats();
        }
        // Don't use formatError here as it might cause body stream issues
        // Error already handled by safeLogError below
      const stats: NotificationStats = {
        total: data.length,
        unread: data.filter(n => !n.is_read).length,
        starred: data.filter(n => n.is_starred).length,
        urgent: data.filter(n => n.priority === 'urgent').length,
        by_type: {} as Record<NotificationType, number>,
        by_priority: {} as Record<NotificationPriority, number>
      };

      // Count by type and priority
      data.forEach(notification => {
        stats.by_type[notification.type] = (stats.by_type[notification.type] || 0) + 1;
        stats.by_priority[notification.priority] = (stats.by_priority[notification.priority] || 0) + 1;
      });

      return stats;
    } catch (error) {
      // Use safe error logging to avoid body stream issues
      safeLogError("Error fetching notification stats", error);
      return this.getFallbackStats();
    }
  }

  async createNotification(
    notification: Omit<UserNotification, "id" | "created_at" | "is_read" | "is_starred">
  ): Promise<UserNotification | null> {
    try {
      // Check user preferences before creating
      if (!(await this.shouldSendNotification(notification))) {
        console.info("Notification blocked by user preferences");
        return null;
      }

      const newNotification = {
        ...notification,
        is_read: false,
        is_starred: false,
      };

      const { data, error } = await supabase
        .from("user_notifications")
        .insert(newNotification)
        .select()
        .single();

      if (error) {
        if (error.code === '42P01') {
          console.info("User notifications table not yet created. Cannot create notification.");
          return null;
        }
        throw error;
      }

      // Send push notification if enabled
      if (data && this.preferences?.push_notifications) {
        await this.sendPushNotification(data);
      }

      return data;
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === '42P01') {
        console.info("User notifications table not yet created. Cannot create notification.");
        return null;
      }

      if (error) {
        console.error("Error creating notification:", error instanceof Error ? error.message : String(error));
      }
      return null;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    if (notificationId.startsWith('fallback-')) {
      console.info("Marking fallback notification as read (client-side only)");
      return;
    }

    try {
      const { error } = await supabase
        .from("user_notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq("id", notificationId)
        .eq("user_id", this.userId);

      if (error && error.code === '42P01') {
        console.info("User notifications table not yet created. Cannot mark as read.");
        return;
      }

      if (error) throw error;
    } catch (error) {
      if (!notificationId.startsWith("fallback-")) {
        console.error("Error marking notification as read:", error instanceof Error ? error.message : String(error));
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
          read_at: new Date().toISOString()
        })
        .eq("user_id", this.userId)
        .eq("is_read", false);

      if (error && error.code === '42P01') {
        console.info("User notifications table not yet created. Cannot mark all as read.");
        return;
      }

      if (error) throw error;
    } catch (error) {
      console.error("Error marking all notifications as read:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async toggleStar(notificationId: string): Promise<void> {
    if (notificationId.startsWith('fallback-')) {
      console.info("Cannot star fallback notifications");
      return;
    }

    try {
      // First get current state
      const { data: current, error: fetchError } = await supabase
        .from("user_notifications")
        .select("is_starred")
        .eq("id", notificationId)
        .eq("user_id", this.userId)
        .single();

      if (fetchError) {
        if (fetchError.code === '42P01') {
          console.info("User notifications table not yet created. Cannot toggle star.");
          return;
        }
        throw fetchError;
      }

      const newStarredState = !current.is_starred;
      const updateData: any = {
        is_starred: newStarredState
      };

      if (newStarredState) {
        updateData.starred_at = new Date().toISOString();
      } else {
        updateData.starred_at = null;
      }

      const { error } = await supabase
        .from("user_notifications")
        .update(updateData)
        .eq("id", notificationId)
        .eq("user_id", this.userId);

      if (error) throw error;
    } catch (error) {
      if (!notificationId.startsWith('fallback-')) {
        console.error("Error toggling notification star:", error instanceof Error ? error.message : String(error));
      }
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    if (notificationId.startsWith('fallback-')) {
      console.info("Cannot delete fallback notifications");
      return;
    }

    try {
      const { error } = await supabase
        .from("user_notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", this.userId);

      if (error && error.code === '42P01') {
        console.info("User notifications table not yet created. Cannot delete notification.");
        return;
      }

      if (error) throw error;
    } catch (error) {
      if (!notificationId.startsWith('fallback-')) {
        console.error("Error deleting notification:", error instanceof Error ? error.message : String(error));
      }
      throw error;
    }
  }

  // === BULK OPERATIONS ===

  async bulkMarkAsRead(notificationIds: string[]): Promise<void> {
    const realIds = notificationIds.filter(id => !id.startsWith('fallback-'));
    if (realIds.length === 0) return;

    try {
      const { error } = await supabase
        .from("user_notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .in("id", realIds)
        .eq("user_id", this.userId);

      if (error && error.code === '42P01') {
        console.info("User notifications table not yet created. Cannot bulk mark as read.");
        return;
      }

      if (error) throw error;
    } catch (error) {
      console.error("Error bulk marking notifications as read:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async bulkDelete(notificationIds: string[]): Promise<void> {
    const realIds = notificationIds.filter(id => !id.startsWith('fallback-'));
    if (realIds.length === 0) return;

    try {
      const { error } = await supabase
        .from("user_notifications")
        .delete()
        .in("id", realIds)
        .eq("user_id", this.userId);

      if (error && error.code === '42P01') {
        console.info("User notifications table not yet created. Cannot bulk delete.");
        return;
      }

      if (error) throw error;
    } catch (error) {
      console.error("Error bulk deleting notifications:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  // === PREFERENCES MANAGEMENT ===

  async getPreferences(): Promise<NotificationPreferences | null> {
    if (!this.userId) return null;

    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", this.userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No preferences found, create default
        return await this.createDefaultPreferences();
      }

      if (error && error.code === '42P01') {
        console.info("Notification preferences table not yet created. Using defaults.");
        return this.getDefaultPreferences();
      }

      if (error) {
        // Error handled by safeLogError in catch block
        return this.getDefaultPreferences();
      }

      this.preferences = data;
      return data;
    } catch (error) {
      // Use safe error logging to avoid body stream issues
      safeLogError("Error fetching notification preferences", error);
      return this.getDefaultPreferences();
    }
  }

  async updatePreferences(
    updates: Partial<Omit<NotificationPreferences, "id" | "user_id" | "created_at" | "updated_at">>
  ): Promise<NotificationPreferences | null> {
    if (!this.userId) return null;

    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", this.userId)
        .select()
        .single();

      if (error && error.code === '42P01') {
        console.info("Notification preferences table not yet created. Cannot update preferences.");
        return null;
      }

      if (error) throw error;

      this.preferences = data;
      return data;
    } catch (error) {
      // Use simple error logging to avoid body stream issues
      console.error("Error updating notification preferences:", error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  // === PUSH NOTIFICATIONS ===

  async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn("Push notifications not supported in this browser");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await this.setupPushSubscription();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error requesting push permission:", error);
      return false;
    }
  }

  private async setupPushSubscription(): Promise<void> {
    try {
      // Check if service worker is supported
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.info("Push notifications not supported in this browser");
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      // Check if push manager is available
      if (!registration.pushManager) {
        console.info("Push manager not available");
        return;
      }

      // Check if VAPID key is configured
      const vapidKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.info("VAPID public key not configured, skipping push subscription setup");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidKey)
      });

      this.pushSubscription = subscription;

      // Save subscription to database with fallback handling
      try {
        await supabase
          .from("push_subscriptions")
          .upsert({
            user_id: this.userId,
            endpoint: subscription.endpoint,
            keys: JSON.stringify(subscription.toJSON()),
            updated_at: new Date().toISOString()
          });
        console.info("Push subscription saved to database");
      } catch (dbError: any) {
        if (dbError.code === '42P01') {
          console.info("Push subscriptions table not yet created. Subscription will be stored locally only.");
        } else {
          console.warn(
            "Failed to save push subscription to database:",
            dbError instanceof Error ? dbError.message : String(dbError),
          );
        }
      }
    } catch (error) {
      console.error("Error setting up push subscription:", error instanceof Error ? error.message : String(error));
    }
    if (!this.pushSubscription) return;

    // This would be handled by your backend service
    // For now, we'll use the browser's Notification API
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.svg',
        badge: '/logo.svg',
        image: notification.image_url,
        tag: notification.id,
        data: {
          url: notification.action_url,
          notificationId: notification.id
        }
      });
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // === UTILITY METHODS ===

  private async shouldSendNotification(notification: Partial<UserNotification>): Promise<boolean> {
    if (!this.preferences) {
      await this.loadPreferences();
    }

    if (!this.preferences) return true; // Default to sending

    // Check quiet hours
    if (this.preferences.quiet_hours_enabled && this.isInQuietHours()) {
      return false;
    }

    // Check type-specific preferences
    switch (notification.type) {
      case 'friend_request':
        return this.preferences.friend_requests;
      case 'watch_party_invite':
        return this.preferences.watch_party_invites;
      case 'content_recommendation':
        return this.preferences.new_content;
      case 'system_update':
      case 'announcement':
        return this.preferences.system_updates;
      case 'promo':
        return this.preferences.marketing;
      default:
        return true;
    }
  }

  private isInQuietHours(): boolean {
    if (!this.preferences?.quiet_hours_enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = this.preferences.quiet_hours_start.split(':').map(Number);
    const [endHour, endMin] = this.preferences.quiet_hours_end.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Crosses midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private async loadPreferences(): Promise<void> {
    this.preferences = await this.getPreferences();
  }

  private async createDefaultPreferences(): Promise<NotificationPreferences> {
    const defaultPrefs = this.getDefaultPreferences();

    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .insert({
          user_id: this.userId,
          ...defaultPrefs
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating default preferences:", error);
      return defaultPrefs;
    }
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      id: 'default',
      user_id: this.userId!,
      email_notifications: true,
      push_notifications: true,
      watch_party_invites: true,
      friend_requests: true,
      new_content: true,
      system_updates: true,
      marketing: false,
      quiet_hours_enabled: false,
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  private getFallbackNotifications(): UserNotification[] {
    if (!this.userId) return [];

    return [
      {
        id: "fallback-1",
        user_id: this.userId,
        title: "Welcome to FlickPick! 🎬",
        message: "Start exploring amazing movies and TV shows. Create your first watchlist and join the community!",
        type: "success",
        priority: "high",
        is_read: false,
        is_starred: false,
        action_url: "/browse",
        image_url: "https://images.unsplash.com/photo-1489599843715-1781463066ac?w=400&h=200&fit=crop",
        actions: [
          { id: "browse", label: "Browse Movies", action: "navigate", url: "/browse", style: "primary" },
          { id: "dismiss", label: "Dismiss", action: "dismiss", style: "secondary" }
        ],
        created_at: new Date().toISOString(),
      },
      {
        id: "fallback-2",
        user_id: this.userId,
        title: "New Feature: Watch Parties! 🎉",
        message: "Invite friends to watch movies together in real-time. Create or join a watch party now!",
        type: "announcement",
        priority: "medium",
        is_read: false,
        is_starred: false,
        action_url: "/community",
        image_url: "https://images.unsplash.com/photo-1489599843715-1781463066ac?w=400&h=200&fit=crop",
        actions: [
          { id: "create-party", label: "Create Party", action: "navigate", url: "/watch-party", style: "primary" },
          { id: "learn-more", label: "Learn More", action: "navigate", url: "/help", style: "secondary" }
        ],
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "fallback-3",
        user_id: this.userId,
        title: "🔧 Database Setup Required",
        message: "Admin: Run the notification system migration to enable full notification features including push notifications, preferences, and analytics.",
        type: "info",
        priority: "low",
        is_read: false,
        is_starred: false,
        metadata: { admin_only: true },
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
  }

  private getFallbackStats(): NotificationStats {
    const fallbackNotifications = this.getFallbackNotifications();

    const stats: NotificationStats = {
      total: fallbackNotifications.length,
      unread: fallbackNotifications.filter(n => !n.is_read).length,
      starred: fallbackNotifications.filter(n => n.is_starred).length,
      urgent: fallbackNotifications.filter(n => n.priority === 'urgent').length,
      by_type: {} as Record<NotificationType, number>,
      by_priority: {} as Record<NotificationPriority, number>
    };

    fallbackNotifications.forEach(notification => {
      stats.by_type[notification.type] = (stats.by_type[notification.type] || 0) + 1;
      stats.by_priority[notification.priority] = (stats.by_priority[notification.priority] || 0) + 1;
    });

    return stats;
  }

  // === REAL-TIME SUBSCRIPTIONS ===

  subscribeToNotifications(callback: (notification: UserNotification) => void): () => void {
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
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.warn("Could not subscribe to notifications - table may not exist:", error);
      return () => {};
    }
  }

  // === ADMIN FUNCTIONS ===

  async sendBulkNotification(
    userIds: string[],
    notification: Omit<UserNotification, "id" | "user_id" | "created_at" | "is_read" | "is_starred">
  ): Promise<void> {
    try {
      // First check if the table exists
      const { error: testError } = await supabase
        .from("user_notifications")
        .select("id")
        .limit(1);

      if (testError && testError.code === '42P01') {
        console.info("User notifications table not yet created. Cannot send bulk notification.");
        return;
      }

      const notifications = userIds.map(userId => ({
        ...notification,
        user_id: userId,
        is_read: false,
        is_starred: false,
      }));

      const { error } = await supabase
        .from("user_notifications")
        .insert(notifications);

      if (error) {
        if (error.code === '42P01') {
          console.info("User notifications table not yet created. Cannot send bulk notification.");
          return;
        }
        throw error;
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === '42P01') {
        console.info("User notifications table not yet created. Cannot send bulk notification.");
        return;
      }

      if (error) {
        console.error("Error sending bulk notification:", error instanceof Error ? error.message : String(error));
      }
      throw error;
    }
  }

  async sendSampleNotifications(): Promise<void> {
    if (!this.userId) return;

    // First check if the table exists
    try {
      const { error: testError } = await supabase
        .from("user_notifications")
        .select("id")
        .limit(1);

      if (testError && testError.code === '42P01') {
        console.info("User notifications table not yet created. Cannot send sample notifications. Using fallback notifications instead.");
        return;
      }
    } catch (error) {
      console.info("User notifications table not accessible. Cannot send sample notifications. Using fallback notifications instead.");
      return;
    }

    const sampleNotifications = [
      {
        user_id: this.userId,
        title: "🎬 Welcome to FlickPick!",
        message: "Start exploring amazing movies and TV shows. Create your first watchlist!",
        type: "success" as const,
        priority: "medium" as const,
        action_url: "/browse",
        image_url: "https://images.unsplash.com/photo-1489599843715-1781463066ac?w=400&h=200&fit=crop",
        actions: [
          { id: "browse", label: "Browse Now", action: "navigate", url: "/browse", style: "primary" as const }
        ]
      },
      {
        user_id: this.userId,
        title: "🎉 New Feature Available",
        message: "Watch parties are now live! Invite friends to watch movies together.",
        type: "announcement" as const,
        priority: "high" as const,
        action_url: "/community",
        image_url: "https://images.unsplash.com/photo-1489599843715-1781463066ac?w=400&h=200&fit=crop",
        actions: [
          { id: "create-party", label: "Create Party", action: "navigate", url: "/watch-party", style: "primary" as const },
          { id: "learn-more", label: "Learn More", action: "navigate", url: "/help", style: "secondary" as const }
        ]
      },
      {
        user_id: this.userId,
        title: "📈 Trending Now",
        message: "Check out the most popular movies this week.",
        type: "content_recommendation" as const,
        priority: "low" as const,
        action_url: "/trending",
      },
      {
        user_id: this.userId,
        title: "🏆 Achievement Unlocked!",
        message: "You've watched 10 movies this month! Keep up the great work.",
        type: "achievement" as const,
        priority: "medium" as const,
        image_url: "https://images.unsplash.com/photo-1489599843715-1781463066ac?w=400&h=200&fit=crop",
      },
      {
        user_id: this.userId,
        title: "⚠️ System Maintenance",
        message: "Scheduled maintenance will occur tonight from 2-4 AM EST.",
        type: "system_update" as const,
        priority: "high" as const,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expires in 24 hours
      }
    ];

    for (const notification of sampleNotifications) {
      await this.createNotification(notification);
    }
  }
}

export const enhancedNotificationsService = new EnhancedNotificationsService();