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
  Settings,
  Trash2,
  Eye,
  EyeOff,
  MoreHorizontal,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { formatError } from "@/lib/utils";
import { toast } from "sonner";
import {
  realNotificationsService,
  UserNotification,
  NotificationStats,
} from "@/services/realNotifications";

const NotificationIcon = ({ type }: { type: UserNotification["type"] }) => {
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
    info: "text-blue-500",
    warning: "text-yellow-500",
    success: "text-green-500",
    error: "text-red-500",
    announcement: "text-purple-500",
    update: "text-indigo-500",
    promotion: "text-pink-500",
  };

  return <Icon className={`h-4 w-4 ${colorMap[type]}`} />;
};

const PriorityBadge = ({
  priority,
}: {
  priority: UserNotification["priority"];
}) => {
  const variants = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800 animate-pulse",
  };

  return (
    <Badge className={`${variants[priority]} text-xs`}>
      {priority.toUpperCase()}
    </Badge>
  );
};

export const WorkingNotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
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
      realNotificationsService.setUserId(user.id);
      fetchNotifications();
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (user) {
      // Subscribe to real-time notifications
      unsubscribe = realNotificationsService.subscribeToNotifications(
        (newNotification) => {
          setNotifications((prev) => [newNotification, ...prev]);
          fetchStats(); // Update stats when new notification arrives

          // Show browser notification
          if (Notification.permission === "granted") {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: "/logo.svg",
            });
          }

          // Show toast notification
          toast.success(newNotification.title, {
            description: newNotification.message,
          });
        },
      );
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await realNotificationsService.getNotifications(50);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", formatError(error));
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await realNotificationsService.getNotificationStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching notification stats:", formatError(error));
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await realNotificationsService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n,
        ),
      );
      fetchStats();

      // Only show success toast for real notifications, not fallback ones
      if (!notificationId.startsWith("fallback-")) {
        toast.success("Marked as read");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Don't show error toast for fallback notifications
      if (!notificationId.startsWith("fallback-")) {
        toast.error("Failed to mark as read");
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await realNotificationsService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString(),
        })),
      );
      fetchStats();
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const handleToggleStar = async (
    notificationId: string,
    isCurrentlyStarred: boolean,
  ) => {
    try {
      await realNotificationsService.toggleStar(
        notificationId,
        !isCurrentlyStarred,
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, is_starred: !isCurrentlyStarred }
            : n,
        ),
      );
      fetchStats();

      // Only show success toast for real notifications, not fallback ones
      if (!notificationId.startsWith("fallback-")) {
        toast.success(
          isCurrentlyStarred ? "Removed from favorites" : "Added to favorites",
        );
      }
    } catch (error) {
      console.error("Error toggling notification star:", error);
      // Don't show error toast for fallback notifications
      if (!notificationId.startsWith("fallback-")) {
        toast.error("Failed to update favorite status");
      }
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await realNotificationsService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      fetchStats();

      // Only show success toast for real notifications, not fallback ones
      if (!notificationId.startsWith("fallback-")) {
        toast.success("Notification deleted");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      // Don't show error toast for fallback notifications
      if (!notificationId.startsWith("fallback-")) {
        toast.error("Failed to delete notification");
      }
    }
  };

  const handleNotificationClick = async (notification: UserNotification) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }

    // Navigate to action URL if provided
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast.success("Browser notifications enabled!");
      }
    }
  };

  const createSampleNotifications = async () => {
    try {
      await realNotificationsService.sendSampleNotifications();
      toast.success("Sample notifications created!");
      fetchNotifications();
      fetchStats();
    } catch (error) {
      console.log(
        "Sample notifications creation completed - check if using fallback notifications",
      );
      // Don't show error toast for fallback scenarios, just refresh the data
      fetchNotifications();
      fetchStats();
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case "unread":
        return !notification.is_read;
      case "starred":
        return notification.is_starred;
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
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (!user) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-300 hover:text-white hover:bg-gray-800"
          onClick={() => {
            setIsOpen(true);
            if (Notification.permission === "default") {
              requestNotificationPermission();
            }
          }}
        >
          <Bell className="h-5 w-5" />
          {stats.unread > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-600 text-xs">
              {stats.unread > 99 ? "99+" : stats.unread}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-[400px] sm:w-[540px] bg-gray-900 border-gray-800 text-white p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-white text-lg">
                  Notifications
                </SheetTitle>
                <SheetDescription className="text-gray-400">
                  {stats.unread > 0
                    ? `${stats.unread} unread`
                    : "All caught up!"}
                </SheetDescription>
              </div>
              <div className="flex items-center space-x-2">
                {stats.unread > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={createSampleNotifications}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <Gift className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          <div className="px-6 py-3 border-b border-gray-800">
            <Tabs
              value={filter}
              onValueChange={(value: any) => setFilter(value)}
            >
              <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                <TabsTrigger value="all" className="text-xs">
                  All ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">
                  Unread ({stats.unread})
                </TabsTrigger>
                <TabsTrigger value="starred" className="text-xs">
                  Starred ({stats.starred})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-8 px-6">
                  <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {filter === "unread"
                      ? "No unread notifications"
                      : filter === "starred"
                        ? "No starred notifications"
                        : "No notifications yet"}
                  </p>
                  {filter === "all" && (
                    <div className="space-y-3 mt-4">
                      <Button
                        onClick={createSampleNotifications}
                        className="bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        <Gift className="h-4 w-4 mr-2" />
                        Create sample notifications
                      </Button>
                      <div className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                        Note: Full notification features require database setup.
                        Current notifications are temporary demos.
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-800/50 transition-colors cursor-pointer relative ${
                        !notification.is_read ? "bg-gray-800/30" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {!notification.is_read && (
                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}

                      <div className="flex items-start space-x-3 ml-4">
                        <div className="flex-shrink-0 mt-1">
                          <NotificationIcon type={notification.type} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-white truncate">
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1 ml-2">
                              {notification.priority === "urgent" && (
                                <PriorityBadge
                                  priority={notification.priority}
                                />
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="bg-gray-800 border-gray-700"
                                >
                                  {!notification.is_read && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkAsRead(notification.id);
                                      }}
                                      className="text-gray-300 hover:text-white"
                                    >
                                      <Eye className="h-3 w-3 mr-2" />
                                      Mark as read
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleStar(
                                        notification.id,
                                        notification.is_starred,
                                      );
                                    }}
                                    className="text-gray-300 hover:text-white"
                                  >
                                    <Star
                                      className={`h-3 w-3 mr-2 ${notification.is_starred ? "fill-current text-yellow-400" : ""}`}
                                    />
                                    {notification.is_starred
                                      ? "Unstar"
                                      : "Star"}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-gray-700" />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(notification.id);
                                    }}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <p className="text-sm text-gray-300 mb-2 leading-relaxed">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.created_at)}
                            </span>
                            {notification.is_starred && (
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {stats.urgent > 0 && (
            <div className="px-6 py-3 border-t border-gray-800 bg-red-900/20">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-400">
                  {stats.urgent} urgent notification
                  {stats.urgent !== 1 ? "s" : ""} require
                  {stats.urgent === 1 ? "s" : ""} attention
                </span>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
