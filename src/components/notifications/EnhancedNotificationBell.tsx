import React, { useState, useEffect, useCallback } from "react";
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
  Filter,
  Search,
  Calendar,
  Users,
  Heart,
  Trophy,
  Zap,
  ExternalLink,
  ChevronDown,
  CheckCheck,
  Archive,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
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
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { formatError } from "@/lib/utils";
import { toast } from "sonner";
import {
  enhancedNotificationsService,
  UserNotification,
  NotificationStats,
  NotificationFilters,
  NotificationType,
  NotificationPriority,
} from "@/services/enhancedNotifications";

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  const iconMap = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
    announcement: Megaphone,
    friend_request: Users,
    watch_party_invite: Calendar,
    content_recommendation: Heart,
    system_update: Settings,
    reminder: Bell,
    achievement: Trophy,
    promo: Gift,
  };

  const IconComponent = iconMap[type] || Info;
  return <IconComponent className="h-4 w-4" />;
};

const PriorityBadge = ({ priority }: { priority: NotificationPriority }) => {
  const variants = {
    low: "bg-gray-600 text-gray-100",
    medium: "bg-blue-600 text-blue-100",
    high: "bg-orange-600 text-orange-100",
    urgent: "bg-red-600 text-red-100 animate-pulse",
  };

  return (
    <Badge className={`text-xs ${variants[priority]}`}>
      {priority.toUpperCase()}
    </Badge>
  );
};

interface NotificationCardProps {
  notification: UserNotification;
  onMarkAsRead: (id: string) => void;
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => void;
  onAction: (action: string, url?: string) => void;
  isSelected: boolean;
  onSelectChange: (id: string, selected: boolean) => void;
}

const NotificationCard = ({
  notification,
  onMarkAsRead,
  onToggleStar,
  onDelete,
  onAction,
  isSelected,
  onSelectChange,
}: NotificationCardProps) => {
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

  const isExpired =
    notification.expires_at && new Date(notification.expires_at) < new Date();

  return (
    <div
      className={`
      p-4 border border-gray-700 rounded-lg space-y-3 transition-all duration-200
      ${!notification.is_read ? "bg-blue-900/20 border-blue-700/50" : "bg-gray-800/50"}
      ${isSelected ? "ring-2 ring-blue-500" : ""}
      ${isExpired ? "opacity-60" : ""}
    `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) =>
              onSelectChange(notification.id, !!checked)
            }
            className="mt-1"
          />
          <div className="flex items-center gap-2">
            <div
              className={`
              p-1 rounded-full 
              ${
                notification.type === "success"
                  ? "bg-green-600/20 text-green-400"
                  : notification.type === "error"
                    ? "bg-red-600/20 text-red-400"
                    : notification.type === "warning"
                      ? "bg-orange-600/20 text-orange-400"
                      : notification.type === "achievement"
                        ? "bg-yellow-600/20 text-yellow-400"
                        : "bg-blue-600/20 text-blue-400"
              }
            `}
            >
              <NotificationIcon type={notification.type} />
            </div>
            <div className="flex items-center gap-2">
              <h3
                className={`font-medium text-sm ${!notification.is_read ? "text-white" : "text-gray-300"}`}
              >
                {notification.title}
              </h3>
              <PriorityBadge priority={notification.priority} />
              {!notification.is_read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">
            {formatTimeAgo(notification.created_at)}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-300"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-gray-800 border-gray-700"
            >
              <DropdownMenuItem
                onClick={() => onMarkAsRead(notification.id)}
                disabled={
                  notification.is_read ||
                  notification.id.startsWith("fallback-")
                }
                className="text-gray-300 hover:bg-gray-700"
              >
                <Eye className="mr-2 h-4 w-4" />
                {notification.is_read ? "Already read" : "Mark as read"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onToggleStar(notification.id)}
                disabled={notification.id.startsWith("fallback-")}
                className="text-gray-300 hover:bg-gray-700"
              >
                <Star
                  className={`mr-2 h-4 w-4 ${notification.is_starred ? "fill-yellow-400 text-yellow-400" : ""}`}
                />
                {notification.is_starred ? "Unstar" : "Star"}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                onClick={() => onDelete(notification.id)}
                disabled={notification.id.startsWith("fallback-")}
                className="text-red-400 hover:bg-red-900/20"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <p className="text-sm text-gray-400 leading-relaxed">
          {notification.message}
        </p>

        {/* Image */}
        {notification.image_url && (
          <div className="mt-2">
            <img
              src={notification.image_url}
              alt="Notification"
              className="w-full h-32 object-cover rounded-lg border border-gray-700"
            />
          </div>
        )}

        {/* Actions */}
        {notification.actions && notification.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {notification.actions.map((action) => (
              <Button
                key={action.id}
                variant={action.style === "primary" ? "default" : "outline"}
                size="sm"
                onClick={() => onAction(action.action, action.url)}
                className={`text-xs ${
                  action.style === "danger"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : action.style === "primary"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "border-gray-600 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {action.label}
                {action.url && <ExternalLink className="ml-1 h-3 w-3" />}
              </Button>
            ))}
          </div>
        )}

        {/* Metadata */}
        {notification.metadata &&
          Object.keys(notification.metadata).length > 0 && (
            <details className="mt-2">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                Additional Info
              </summary>
              <pre className="text-xs text-gray-600 mt-1 p-2 bg-gray-900 rounded border border-gray-700 overflow-auto">
                {JSON.stringify(notification.metadata, null, 2)}
              </pre>
            </details>
          )}

        {/* Expiry warning */}
        {notification.expires_at && !isExpired && (
          <div className="flex items-center gap-1 text-xs text-orange-400 mt-2">
            <AlertTriangle className="h-3 w-3" />
            Expires {formatTimeAgo(notification.expires_at)}
          </div>
        )}

        {isExpired && (
          <div className="flex items-center gap-1 text-xs text-red-400 mt-2">
            <XCircle className="h-3 w-3" />
            Expired
          </div>
        )}
      </div>
    </div>
  );
};

export default function EnhancedNotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    starred: 0,
    urgent: 0,
    by_type: {} as Record<NotificationType, number>,
    by_priority: {} as Record<NotificationPriority, number>,
  });

  const [filters, setFilters] = useState<NotificationFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState<
    Set<string>
  >(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("all");

  // Initialize service when user changes
  useEffect(() => {
    if (user?.id) {
      enhancedNotificationsService.setUserId(user.id);
      fetchNotifications();
      fetchStats();
    }
  }, [user?.id]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const appliedFilters: NotificationFilters = {
        ...filters,
        search: searchQuery || undefined,
      };

      // Apply tab-specific filters
      if (currentTab === "unread") {
        appliedFilters.is_read = false;
      } else if (currentTab === "starred") {
        appliedFilters.is_starred = true;
      }

      const data =
        await enhancedNotificationsService.getNotifications(appliedFilters);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, filters, searchQuery, currentTab]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      const data = await enhancedNotificationsService.getNotificationStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, [user?.id]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = enhancedNotificationsService.subscribeToNotifications(
      (newNotification) => {
        setNotifications((prev) => [newNotification, ...prev]);
        fetchStats();

        // Show browser notification if permission granted
        if (Notification.permission === "granted") {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: "/logo.svg",
            tag: newNotification.id,
          });
        }
      },
    );

    return unsubscribe;
  }, [user?.id, fetchStats]);

  // Refresh data when filters change
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Handlers
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await enhancedNotificationsService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n,
        ),
      );
      fetchStats();

      if (!notificationId.startsWith("fallback-")) {
        toast.success("Marked as read");
      }
    } catch (error) {
      console.error("Error marking as read:", error);
      if (!notificationId.startsWith("fallback-")) {
        toast.error("Failed to mark as read");
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await enhancedNotificationsService.markAllAsRead();
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
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const handleToggleStar = async (notificationId: string) => {
    try {
      await enhancedNotificationsService.toggleStar(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? {
                ...n,
                is_starred: !n.is_starred,
                starred_at: !n.is_starred
                  ? new Date().toISOString()
                  : undefined,
              }
            : n,
        ),
      );
      fetchStats();

      if (!notificationId.startsWith("fallback-")) {
        toast.success("Updated");
      }
    } catch (error) {
      console.error("Error toggling star:", error);
      if (!notificationId.startsWith("fallback-")) {
        toast.error("Failed to update");
      }
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await enhancedNotificationsService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setSelectedNotifications((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
      fetchStats();

      if (!notificationId.startsWith("fallback-")) {
        toast.success("Notification deleted");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      if (!notificationId.startsWith("fallback-")) {
        toast.error("Failed to delete notification");
      }
    }
  };

  const handleAction = (action: string, url?: string) => {
    if (action === "navigate" && url) {
      window.location.href = url;
    } else if (action === "dismiss") {
      // Just close the notification panel
      setIsOpen(false);
    }
  };

  const handleBulkMarkAsRead = async () => {
    try {
      const selectedIds = Array.from(selectedNotifications);
      await enhancedNotificationsService.bulkMarkAsRead(selectedIds);
      setNotifications((prev) =>
        prev.map((n) =>
          selectedIds.includes(n.id)
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n,
        ),
      );
      setSelectedNotifications(new Set());
      fetchStats();
      toast.success(`Marked ${selectedIds.length} notifications as read`);
    } catch (error) {
      console.error("Error bulk marking as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const selectedIds = Array.from(selectedNotifications);
      await enhancedNotificationsService.bulkDelete(selectedIds);
      setNotifications((prev) =>
        prev.filter((n) => !selectedIds.includes(n.id)),
      );
      setSelectedNotifications(new Set());
      fetchStats();
      toast.success(`Deleted ${selectedIds.length} notifications`);
    } catch (error) {
      console.error("Error bulk deleting:", error);
      toast.error("Failed to delete notifications");
    }
  };

  const createSampleNotifications = async () => {
    try {
      setIsLoading(true);
      await enhancedNotificationsService.sendSampleNotifications();
      await fetchNotifications();
      await fetchStats();
      toast.success("Sample notifications created!");
    } catch (error) {
      console.log(
        "Sample notifications creation completed - check if using fallback notifications",
      );
      await fetchNotifications();
      await fetchStats();
    } finally {
      setIsLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("This browser doesn't support notifications");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      toast.success("Notifications enabled!");
      await enhancedNotificationsService.requestPushPermission();
    } else {
      toast.error("Notification permission denied");
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (currentTab === "unread" && notification.is_read) return false;
    if (currentTab === "starred" && !notification.is_starred) return false;
    if (
      searchQuery &&
      !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

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
          {stats.urgent > 0 && (
            <div className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-red-500 rounded-full animate-ping" />
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-[400px] sm:w-[500px] bg-gray-900 border-gray-800 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 pb-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-white">Notifications</SheetTitle>
              <div className="flex items-center gap-2">
                {selectedNotifications.size > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-gray-600"
                      >
                        Actions ({selectedNotifications.size})
                        <ChevronDown className="ml-1 h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-800 border-gray-700">
                      <DropdownMenuItem
                        onClick={handleBulkMarkAsRead}
                        className="text-gray-300 hover:bg-gray-700"
                      >
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Mark as Read
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleBulkDelete}
                        className="text-red-400 hover:bg-red-900/20"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={createSampleNotifications}
                  disabled={isLoading}
                  className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  {isLoading ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <Zap className="h-3 w-3" />
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-gray-600"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-700">
                    <DropdownMenuItem
                      onClick={handleMarkAllAsRead}
                      className="text-gray-300 hover:bg-gray-700"
                    >
                      <CheckCheck className="mr-2 h-4 w-4" />
                      Mark All Read
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={requestNotificationPermission}
                      className="text-gray-300 hover:bg-gray-700"
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Enable Push Notifications
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
                      <Settings className="mr-2 h-4 w-4" />
                      Notification Settings
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Total: {stats.total}</span>
              <span>Unread: {stats.unread}</span>
              <span>Starred: {stats.starred}</span>
              {stats.urgent > 0 && (
                <span className="text-red-400 font-medium">
                  Urgent: {stats.urgent}
                </span>
              )}
            </div>
          </SheetHeader>

          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-800 space-y-3">
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            />

            <div className="flex items-center gap-2">
              <Select
                value={filters.type || ""}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    type: (value as NotificationType) || undefined,
                  }))
                }
              >
                <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="friend_request">Friend Request</SelectItem>
                  <SelectItem value="watch_party_invite">
                    Watch Party
                  </SelectItem>
                  <SelectItem value="content_recommendation">
                    Recommendation
                  </SelectItem>
                  <SelectItem value="achievement">Achievement</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.priority || ""}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    priority: (value as NotificationPriority) || undefined,
                  }))
                }
              >
                <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({});
                  setSearchQuery("");
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={currentTab}
            onValueChange={setCurrentTab}
            className="flex-1 flex flex-col"
          >
            <TabsList className="mx-4 mt-2 bg-gray-800">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-gray-700"
              >
                All ({stats.total})
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="data-[state=active]:bg-gray-700"
              >
                Unread ({stats.unread})
              </TabsTrigger>
              <TabsTrigger
                value="starred"
                className="data-[state=active]:bg-gray-700"
              >
                Starred ({stats.starred})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 mt-0">
              <ScrollArea className="h-full px-4">
                <div className="space-y-3 py-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No notifications found</p>
                      {searchQuery && (
                        <p className="text-sm mt-1">
                          Try adjusting your search or filters
                        </p>
                      )}
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onToggleStar={handleToggleStar}
                        onDelete={handleDelete}
                        onAction={handleAction}
                        isSelected={selectedNotifications.has(notification.id)}
                        onSelectChange={(id, selected) => {
                          setSelectedNotifications((prev) => {
                            const newSet = new Set(prev);
                            if (selected) {
                              newSet.add(id);
                            } else {
                              newSet.delete(id);
                            }
                            return newSet;
                          });
                        }}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="unread" className="flex-1 mt-0">
              <ScrollArea className="h-full px-4">
                <div className="space-y-3 py-4">
                  {filteredNotifications.filter((n) => !n.is_read).length ===
                  0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>All caught up!</p>
                      <p className="text-sm mt-1">No unread notifications</p>
                    </div>
                  ) : (
                    filteredNotifications
                      .filter((n) => !n.is_read)
                      .map((notification) => (
                        <NotificationCard
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                          onToggleStar={handleToggleStar}
                          onDelete={handleDelete}
                          onAction={handleAction}
                          isSelected={selectedNotifications.has(
                            notification.id,
                          )}
                          onSelectChange={(id, selected) => {
                            setSelectedNotifications((prev) => {
                              const newSet = new Set(prev);
                              if (selected) {
                                newSet.add(id);
                              } else {
                                newSet.delete(id);
                              }
                              return newSet;
                            });
                          }}
                        />
                      ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="starred" className="flex-1 mt-0">
              <ScrollArea className="h-full px-4">
                <div className="space-y-3 py-4">
                  {filteredNotifications.filter((n) => n.is_starred).length ===
                  0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No starred notifications</p>
                      <p className="text-sm mt-1">
                        Star important notifications to find them easily
                      </p>
                    </div>
                  ) : (
                    filteredNotifications
                      .filter((n) => n.is_starred)
                      .map((notification) => (
                        <NotificationCard
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                          onToggleStar={handleToggleStar}
                          onDelete={handleDelete}
                          onAction={handleAction}
                          isSelected={selectedNotifications.has(
                            notification.id,
                          )}
                          onSelectChange={(id, selected) => {
                            setSelectedNotifications((prev) => {
                              const newSet = new Set(prev);
                              if (selected) {
                                newSet.add(id);
                              } else {
                                newSet.delete(id);
                              }
                              return newSet;
                            });
                          }}
                        />
                      ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
