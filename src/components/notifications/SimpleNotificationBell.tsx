import React, { useState, useEffect } from "react";
import {
  Bell,
  Info,
  AlertTriangle,
  CheckCircle,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import {
  simpleNotificationService,
  AdminMessage,
} from "@/services/simpleNotifications";
import { toast } from "sonner";

const NotificationIcon = ({ type }: { type: AdminMessage["type"] }) => {
  const iconMap = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    announcement: Megaphone,
  };

  const Icon = iconMap[type] || Info;

  const colorMap = {
    info: "text-blue-400",
    warning: "text-yellow-400",
    success: "text-green-400",
    announcement: "text-purple-400",
  };

  return <Icon className={`h-5 w-5 ${colorMap[type]}`} />;
};

export const SimpleNotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      simpleNotificationService.setUserId(user.id);
      fetchMessages();
    }
  }, [user]);

  useEffect(() => {
    let subscription: any = null;

    if (user) {
      subscription = simpleNotificationService.subscribeToMessages(
        (newMessage) => {
          setMessages((prev) => [newMessage, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Show toast for new admin message
          toast.info("New message from admin", {
            description: newMessage.title,
          });
        },
      );
    }

    return () => {
      if (subscription) {
        subscription();
      }
    };
  }, [user?.id]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const [adminMessages, unreadCount] = await Promise.all([
        simpleNotificationService.getAdminMessages(),
        simpleNotificationService.getUnreadCount(),
      ]);

      setMessages(adminMessages);
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error("Error fetching admin messages:", error);
      setMessages([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await simpleNotificationService.markAsRead(messageId);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isRead: true } : msg,
        ),
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const handleMessageClick = async (message: AdminMessage) => {
    if (!message.isRead) {
      await markAsRead(message.id);
    }
  };

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
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-600 text-white text-xs">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-96 bg-gray-950 border-gray-800 text-white">
        <SheetHeader>
          <div className="flex items-center space-x-2">
            <img
              src="https://cdn.builder.io/api/v1/assets/3a5e046f24294e60a3c1afd0f4c614eb/chatgpt-image-jun-21-2025-03_27_04-pm-65410f?format=webp&width=800"
              alt="FlickPick"
              className="h-6 w-auto"
            />
            <SheetTitle className="text-white">Admin Messages</SheetTitle>
          </div>
          <SheetDescription className="text-gray-400">
            {messages.length} messages • {unreadCount} unread
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <ScrollArea className="h-[calc(100vh-150px)]">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">No messages from admin</p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((message) => (
                  <Card
                    key={message.id}
                    className={`border-gray-800 cursor-pointer transition-all hover:bg-gray-800/50 ${
                      !message.isRead
                        ? "bg-gray-900/80 border-blue-600/30"
                        : "bg-gray-900/40"
                    }`}
                    onClick={() => handleMessageClick(message)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <NotificationIcon type={message.type} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4
                              className={`text-sm font-medium ${
                                !message.isRead ? "text-white" : "text-gray-300"
                              }`}
                            >
                              {message.title}
                            </h4>
                            {!message.isRead && (
                              <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>

                          <p className="text-xs text-gray-400 mb-2 line-clamp-3">
                            {message.message}
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{formatTimeAgo(message.created_at)}</span>
                            <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                              Admin
                            </span>
                          </div>
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

export default SimpleNotificationBell;
