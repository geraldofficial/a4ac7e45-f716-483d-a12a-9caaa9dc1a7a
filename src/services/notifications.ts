export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'new_content' | 'watch_party' | 'recommendation' | 'general';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

class NotificationsService {
  private getStorageKey(): string {
    return 'app_notifications';
  }

  async getNotifications(): Promise<AppNotification[]> {
    const notifications = localStorage.getItem(this.getStorageKey());
    return notifications ? JSON.parse(notifications) : [];
  }

  async addNotification(notification: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>): Promise<void> {
    const newNotification: AppNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    const existingNotifications = await this.getNotifications();
    existingNotifications.unshift(newNotification); // Add to beginning
    
    // Keep only last 50 notifications
    const trimmedNotifications = existingNotifications.slice(0, 50);
    
    localStorage.setItem(this.getStorageKey(), JSON.stringify(trimmedNotifications));
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notifications = await this.getNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.isRead = true;
      localStorage.setItem(this.getStorageKey(), JSON.stringify(notifications));
    }
  }

  async markAllAsRead(): Promise<void> {
    const notifications = await this.getNotifications();
    notifications.forEach(n => n.isRead = true);
    localStorage.setItem(this.getStorageKey(), JSON.stringify(notifications));
  }

  async getUnreadCount(): Promise<number> {
    const notifications = await this.getNotifications();
    return notifications.filter(n => !n.isRead).length;
  }

  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Simulate new content notifications
  async simulateNewContentNotification(): Promise<void> {
    await this.addNotification({
      title: 'New Content Available!',
      message: 'Check out the latest movies and TV shows added to FlickPick.',
      type: 'new_content',
      actionUrl: '/trending'
    });
  }
}

export const notificationsService = new NotificationsService();
