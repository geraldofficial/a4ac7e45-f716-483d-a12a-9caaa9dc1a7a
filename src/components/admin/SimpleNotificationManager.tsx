import React, { useState } from "react";
import {
  Send,
  Users,
  User,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import {
  simpleNotificationService,
  AdminMessage,
} from "@/services/simpleNotifications";
import { toast } from "sonner";

export default function SimpleNotificationManager() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Message form state
  const [messageForm, setMessageForm] = useState({
    title: "",
    message: "",
    type: "info" as AdminMessage["type"],
    target: "all" as "all" | "single",
    userId: "",
  });

  const handleSendMessage = async () => {
    if (!messageForm.title || !messageForm.message) {
      toast.error("Title and message are required");
      return;
    }

    if (messageForm.target === "single" && !messageForm.userId) {
      toast.error("User ID is required when sending to a single user");
      return;
    }

    setLoading(true);
    try {
      if (messageForm.target === "all") {
        await simpleNotificationService.sendMessageToAllUsers(
          messageForm.title,
          messageForm.message,
          messageForm.type,
        );
        toast.success("Message sent to all users!");
      } else {
        await simpleNotificationService.sendMessageToUser(
          messageForm.userId,
          messageForm.title,
          messageForm.message,
          messageForm.type,
        );
        toast.success(`Message sent to user ${messageForm.userId}!`);
      }

      // Reset form
      setMessageForm({
        title: "",
        message: "",
        type: "info",
        target: "all",
        userId: "",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleTestMessage = async () => {
    if (!user?.id) return;

    try {
      await simpleNotificationService.sendMessageToUser(
        user.id,
        "🧪 Test Message",
        "This is a test message from the admin panel to verify the messaging system is working correctly.",
        "info",
      );
      toast.success("Test message sent to yourself!");
    } catch (error) {
      console.error("Error sending test message:", error);
      toast.error("Failed to send test message");
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">
          Please log in to access the notification manager.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Messages</h1>
          <p className="text-gray-400">Send messages to users</p>
        </div>
        <Button
          onClick={handleTestMessage}
          variant="outline"
          className="border-gray-600"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Test Message
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Simple Messaging</p>
                <p className="text-lg font-semibold text-white">
                  Admin → Users
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">No Complex Features</p>
                <p className="text-lg font-semibold text-white">
                  Just Messages
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Easy to Use</p>
                <p className="text-lg font-semibold text-white">Send & Done</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Send Message Form */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Message to Users
          </CardTitle>
          <CardDescription className="text-gray-400">
            Send a simple message to users. No complex features, just messaging.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Message Title</Label>
            <Input
              value={messageForm.title}
              onChange={(e) =>
                setMessageForm((prev) => ({ ...prev, title: e.target.value }))
              }
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter message title"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Message Content</Label>
            <Textarea
              value={messageForm.message}
              onChange={(e) =>
                setMessageForm((prev) => ({ ...prev, message: e.target.value }))
              }
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter your message here..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Message Type</Label>
              <Select
                value={messageForm.type}
                onValueChange={(value) =>
                  setMessageForm((prev) => ({
                    ...prev,
                    type: value as AdminMessage["type"],
                  }))
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="info">ℹ️ Info</SelectItem>
                  <SelectItem value="success">✅ Success</SelectItem>
                  <SelectItem value="warning">⚠️ Warning</SelectItem>
                  <SelectItem value="announcement">📢 Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Send To</Label>
              <Select
                value={messageForm.target}
                onValueChange={(value) =>
                  setMessageForm((prev) => ({
                    ...prev,
                    target: value as "all" | "single",
                    userId: "",
                  }))
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      All Users
                    </div>
                  </SelectItem>
                  <SelectItem value="single">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Single User
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {messageForm.target === "single" && (
            <div className="space-y-2">
              <Label className="text-white">User ID</Label>
              <Input
                value={messageForm.userId}
                onChange={(e) =>
                  setMessageForm((prev) => ({
                    ...prev,
                    userId: e.target.value,
                  }))
                }
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter user ID"
              />
            </div>
          )}

          {/* Message Preview */}
          <div className="border border-gray-600 rounded-lg p-4 bg-gray-900/50">
            <Label className="text-white text-sm">Preview:</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                {messageForm.type === "info" && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                )}
                {messageForm.type === "success" && (
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                )}
                {messageForm.type === "warning" && (
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                )}
                {messageForm.type === "announcement" && (
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                )}
                <span className="text-white font-medium">
                  {messageForm.title || "Message Title"}
                </span>
              </div>
              <p className="text-gray-300 text-sm pl-4">
                {messageForm.message || "Message content will appear here..."}
              </p>
              <div className="text-xs text-gray-500 pl-4">
                From: Admin •{" "}
                {messageForm.target === "all"
                  ? "To all users"
                  : `To user: ${messageForm.userId || "specific user"}`}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSendMessage}
              disabled={loading || !messageForm.title || !messageForm.message}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-white font-medium">
                Simplified Messaging System
              </p>
              <p className="text-gray-400 text-sm">
                This is a simplified notification system focused only on admin
                messaging. No complex features like preferences, push
                notifications, templates, or scheduling. Just simple, direct
                messages from admin to users.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
