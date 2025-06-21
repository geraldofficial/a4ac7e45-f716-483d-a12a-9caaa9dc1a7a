import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  Gift,
  Megaphone,
  Calendar,
  Users,
  Settings,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { safeLogError } from "@/utils/safeErrorFormat";
import { toast } from "sonner";

interface Notification {
  id: string;
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
  isRead: boolean;
  isStarred: boolean;
  created_at: string;
  expires_at?: string;
  action_url?: string;
  action_label?: string;
  image_url?: string;
  sender_name?: string;
  category?: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  starred: number;
  urgent: number;
}

const NotificationIcon = ({ type }: { type: Notification["type"] }) => {
  const iconMap = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    error: XCircle,
    announcement: Megaphone,
    update: Settings,
    promotion: Gift,
  };

  const Icon = iconMap[type] || Info;

  const colorMap = {
    info: "text-blue-400",
    warning: "text-yellow-400",
    success: "text-green-400",
    error: "text-red-400",
    announcement: "text-purple-400",
    update: "text-indigo-400",
    promotion: "text-pink-400",
  };

  return <Icon className={`h-5 w-5 ${colorMap[type]}`} />;
};

const PriorityBadge = ({
  priority,
}: {
  priority: Notification["priority"];
}) => {
  const variants = {
    low: "bg-gray-600",
    medium: "bg-blue-600",
    high: "bg-orange-600",
    urgent: "bg-red-600 animate-pulse",
  };

  return (
    <Badge className={`${variants[priority]} text-white text-xs`}>
      {priority.toUpperCase()}
    </Badge>
  );
};

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    starred: 0,
    urgent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "starred">("all");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    let subscription: any = null;

    if (user) {
      // Create unique channel name to avoid multiple subscriptions
      const channelName = `user_notifications_${user.id}`;

      subscription = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "user_notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const newNotification = payload.new as any;
              const formattedNotif: Notification = {
                id: newNotification.id,
                title: newNotification.title,
                message: newNotification.message,
                type: newNotification.type,
                priority: newNotification.priority,
                isRead: newNotification.is_read,
                isStarred: newNotification.is_starred,
                created_at: newNotification.created_at,
                expires_at: newNotification.expires_at,
                action_url: newNotification.action_url,
                action_label: newNotification.action_label,
                image_url: newNotification.image_url,
                sender_name: newNotification.sender_name,
                category: newNotification.category,
              };

              setNotifications((prev) => [formattedNotif, ...prev]);

              // Show toast for new notification
              toast.info(formattedNotif.title, {
                description: formattedNotif.message,
              });
            }
          },
        )
        .subscribe();
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // For now, use mock data since the table doesn't exist
      // This will be replaced with real data once the table is created
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "Welcome to FlickPick!",
          message:
            "Thank you for joining FlickPick. Discover amazing movies and TV shows today!",
          type: "success",
          priority: "medium",
          isRead: false,
          isStarred: false,
          created_at: new Date().toISOString(),
          sender_name: "FlickPick Team",
          category: "welcome",
        },
        {
          id: "2",
          title: "New Feature: Watch Parties",
          message:
            "Create watch parties and enjoy movies with friends in real-time!",
          type: "announcement",
          priority: "high",
          isRead: false,
          isStarred: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          sender_name: "FlickPick Team",
          category: "feature",
          action_url: "/watch-party",
          action_label: "Try Now",
        },
      ];

      setNotifications(mockNotifications);
      updateStats(mockNotifications);
    } catch (error) {
      safeLogError("Error fetching notifications", error);
      // Set empty array as fallback
      setNotifications([]);
      updateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (notifications: Notification[]) => {
    const stats = {
      total: notifications.length,
      unread: notifications.filter((n) => !n.isRead).length,
      starred: notifications.filter((n) => n.isStarred).length,
      urgent: notifications.filter((n) => n.priority === "urgent").length,
    };
    setStats(stats);
  };

  const markAsRead = async (notificationId: string) => {
    // Use local state for now until database table is created
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif,
      ),
    );
  };

  const markAllAsRead = async () => {
    // Use local state for now until database table is created
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true })),
    );

    toast.success("All notifications marked as read");
  };

  const toggleStar = async (notificationId: string) => {
    // Use local state for now until database table is created
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId
          ? { ...notif, isStarred: !notif.isStarred }
          : notif,
      ),
    );
  };

  const deleteNotification = async (notificationId: string) => {
    // Use local state for now until database table is created
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId),
    );
    toast.success("Notification deleted");
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Handle action URL if present
    if (notification.action_url) {
      if (notification.action_url.startsWith("http")) {
        window.open(notification.action_url, "_blank");
      } else {
        // Internal navigation
        window.location.href = notification.action_url;
      }
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case "unread":
        return !notification.isRead;
      case "starred":
        return notification.isStarred;
      default:
        return true;
    }
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {stats.unread > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-600 text-white text-xs">
              {stats.unread > 99 ? "99+" : stats.unread}
            </Badge>
          )}
          {stats.urgent > 0 && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-600 rounded-full animate-ping" />
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-96 bg-gray-950 border-gray-800 text-white">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img
                src="https://cdn.builder.io/api/v1/assets/3a5e046f24294e60a3c1afd0f4c614eb/chatgpt-image-jun-21-2025-03_27_04-pm-65410f?format=webp&width=800"
                alt="FlickPick"
                className="h-6 w-auto"
              />
              <SheetTitle className="text-white">Notifications</SheetTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-gray-900 border-gray-700 text-white"
              >
                <DropdownMenuItem
                  onClick={markAllAsRead}
                  className="hover:bg-gray-800"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark all as read
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-gray-800">
                  <Settings className="h-4 w-4 mr-2" />
                  Notification settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <SheetDescription className="text-gray-400">
            {stats.total} total • {stats.unread} unread
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {/* Filter Tabs */}
          <div className="flex space-x-1 mb-4 bg-gray-900 rounded-lg p-1">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              className={`flex-1 ${filter === "all" ? "bg-red-600" : "text-gray-400 hover:text-white"}`}
            >
              All ({stats.total})
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("unread")}
              className={`flex-1 ${filter === "unread" ? "bg-red-600" : "text-gray-400 hover:text-white"}`}
            >
              Unread ({stats.unread})
            </Button>
            <Button
              variant={filter === "starred" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("starred")}
              className={`flex-1 ${filter === "starred" ? "bg-red-600" : "text-gray-400 hover:text-white"}`}
            >
              <Star className="h-3 w-3 mr-1" />
              {stats.starred}
            </Button>
          </div>

          {/* Notifications List */}
          <ScrollArea className="h-[calc(100vh-200px)]">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">No notifications</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`border-gray-800 cursor-pointer transition-all hover:bg-gray-800/50 ${
                      !notification.isRead
                        ? "bg-gray-900/80 border-blue-600/30"
                        : "bg-gray-900/40"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <NotificationIcon type={notification.type} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4
                              className={`text-sm font-medium ${!notification.isRead ? "text-white" : "text-gray-300"}`}
                            >
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1 ml-2">
                              {notification.priority === "urgent" && (
                                <PriorityBadge
                                  priority={notification.priority}
                                />
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStar(notification.id);
                                }}
                                className="h-6 w-6 hover:bg-gray-700"
                              >
                                <Star
                                  className={`h-3 w-3 ${
                                    notification.isStarred
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-400"
                                  }`}
                                />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-6 w-6 hover:bg-gray-700"
                                  >
                                    <Settings className="h-3 w-3 text-gray-400" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="bg-gray-900 border-gray-700 text-white"
                                >
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                    className="hover:bg-gray-800"
                                  >
                                    {notification.isRead ? (
                                      <EyeOff className="h-4 w-4 mr-2" />
                                    ) : (
                                      <Eye className="h-4 w-4 mr-2" />
                                    )}
                                    Mark as{" "}
                                    {notification.isRead ? "unread" : "read"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                    className="hover:bg-gray-800 text-red-400"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {formatTimeAgo(notification.created_at)}
                            </span>
                            {notification.sender_name && (
                              <span>from {notification.sender_name}</span>
                            )}
                          </div>

                          {notification.action_label && (
                            <Button
                              size="sm"
                              className="mt-2 bg-red-600 hover:bg-red-700 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }}
                            >
                              {notification.action_label}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationBell;
