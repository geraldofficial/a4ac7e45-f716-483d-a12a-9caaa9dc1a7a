import React, { useState, useEffect } from "react";
import {
  Bell,
  Send,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Zap,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  enhancedNotificationsService,
  NotificationTemplate,
  ScheduledNotification,
  NotificationType,
  NotificationPriority,
} from "@/services/enhancedNotifications";

interface NotificationStats {
  totalSent: number;
  totalActive: number;
  totalScheduled: number;
  openRate: number;
  clickRate: number;
  recentActivity: Array<{
    id: string;
    type: string;
    count: number;
    timestamp: string;
  }>;
}

export default function NotificationManager() {
  const { user } = useAuth();
  const [stats, setStats] = useState<NotificationStats>({
    totalSent: 0,
    totalActive: 0,
    totalScheduled: 0,
    openRate: 0,
    clickRate: 0,
    recentActivity: [],
  });

  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [scheduledNotifications, setScheduledNotifications] = useState<
    ScheduledNotification[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("broadcast");

  // Broadcast form state
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    type: "info" as NotificationType,
    priority: "medium" as NotificationPriority,
    action_url: "",
    image_url: "",
    target: "all" as "all" | "active" | "custom",
    userIds: [] as string[],
    schedule: false,
    scheduledFor: "",
  });

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: "",
    title: "",
    message: "",
    type: "info" as NotificationType,
    priority: "medium" as NotificationPriority,
    variables: [] as string[],
    is_active: true,
  });

  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<NotificationTemplate | null>(null);

  useEffect(() => {
    if (user?.id) {
      enhancedNotificationsService.setUserId(user.id);
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // In a real app, these would come from the admin service
      // For now, using mock data
      setStats({
        totalSent: 12450,
        totalActive: 8934,
        totalScheduled: 23,
        openRate: 67.8,
        clickRate: 23.4,
        recentActivity: [
          {
            id: "1",
            type: "broadcast_sent",
            count: 1250,
            timestamp: new Date().toISOString(),
          },
          {
            id: "2",
            type: "template_used",
            count: 45,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: "3",
            type: "scheduled_sent",
            count: 12,
            timestamp: new Date(Date.now() - 7200000).toISOString(),
          },
        ],
      });

      // Mock templates
      setTemplates([
        {
          id: "1",
          name: "welcome",
          title: "Welcome to FlickPick! 🎬",
          message:
            "Hi {{user_name}}, welcome to FlickPick! Start exploring amazing movies and TV shows.",
          type: "success",
          priority: "medium",
          variables: ["user_name"],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          name: "friend_request",
          title: "New Friend Request",
          message: "{{requester_name}} wants to be your friend!",
          type: "friend_request",
          priority: "medium",
          variables: ["requester_name"],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      // Mock scheduled notifications
      setScheduledNotifications([
        {
          id: "1",
          user_id: user?.id || "",
          title: "Weekly Movie Recommendations",
          message: "Check out this week's top picks!",
          type: "content_recommendation",
          priority: "medium",
          scheduled_for: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          status: "pending",
          retry_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error loading admin notification data:", error);
      toast.error("Failed to load notification data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastForm.title || !broadcastForm.message) {
      toast.error("Title and message are required");
      return;
    }

    setIsLoading(true);
    try {
      // Mock user IDs for demo
      const userIds =
        broadcastForm.target === "all"
          ? ["demo-user-1", "demo-user-2"]
          : broadcastForm.userIds;

      const notification = {
        title: broadcastForm.title,
        message: broadcastForm.message,
        type: broadcastForm.type,
        priority: broadcastForm.priority,
        action_url: broadcastForm.action_url || undefined,
        image_url: broadcastForm.image_url || undefined,
      };

      await enhancedNotificationsService.sendBulkNotification(
        userIds,
        notification,
      );

      toast.success(`Broadcast sent to ${userIds.length} users!`);
      setBroadcastForm({
        title: "",
        message: "",
        type: "info",
        priority: "medium",
        action_url: "",
        image_url: "",
        target: "all",
        userIds: [],
        schedule: false,
        scheduledFor: "",
      });

      await loadData();
    } catch (error) {
      console.error("Error sending broadcast:", error);
      toast.error("Failed to send broadcast");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.name || !templateForm.title || !templateForm.message) {
      toast.error("Name, title, and message are required");
      return;
    }

    try {
      // In a real app, this would call an admin API
      const newTemplate: NotificationTemplate = {
        id: Date.now().toString(),
        ...templateForm,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setTemplates((prev) => [...prev, newTemplate]);
      toast.success("Template created successfully!");
      setIsTemplateDialogOpen(false);
      setTemplateForm({
        name: "",
        title: "",
        message: "",
        type: "info",
        priority: "medium",
        variables: [],
        is_active: true,
      });
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create template");
    }
  };

  const handleTestNotification = async () => {
    if (!user?.id) return;

    try {
      await enhancedNotificationsService.createNotification({
        user_id: user.id,
        title: "🧪 Admin Test Notification",
        message:
          "This is a test notification from the admin panel to verify the system is working correctly.",
        type: "info",
        priority: "medium",
        actions: [
          {
            id: "dismiss",
            label: "Dismiss",
            action: "dismiss",
            style: "secondary",
          },
        ],
      });
      toast.success("Test notification sent!");
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast.error("Failed to send test notification");
    }
  };

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    color = "blue",
  }: any) => (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {change && (
              <p
                className={`text-xs ${change > 0 ? "text-green-400" : "text-red-400"}`}
              >
                {change > 0 ? "+" : ""}
                {change}% from last month
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-${color}-600/20`}>
            <Icon className={`h-6 w-6 text-${color}-400`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Notification Manager
          </h1>
          <p className="text-gray-400">
            Send, schedule, and manage notifications
          </p>
        </div>
        <Button
          onClick={handleTestNotification}
          variant="outline"
          className="border-gray-600"
        >
          <Zap className="mr-2 h-4 w-4" />
          Send Test
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sent"
          value={stats.totalSent.toLocaleString()}
          change={12.5}
          icon={Send}
          color="blue"
        />
        <StatCard
          title="Active Users"
          value={stats.totalActive.toLocaleString()}
          change={8.2}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Scheduled"
          value={stats.totalScheduled}
          icon={Calendar}
          color="yellow"
        />
        <StatCard
          title="Open Rate"
          value={`${stats.openRate}%`}
          change={-2.1}
          icon={BarChart3}
          color="purple"
        />
      </div>

      {/* Main Content */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-6"
      >
        <TabsList className="bg-gray-800">
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Broadcast Tab */}
        <TabsContent value="broadcast" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                Send Broadcast Notification
              </CardTitle>
              <CardDescription className="text-gray-400">
                Send a notification to multiple users at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Title</Label>
                  <Input
                    value={broadcastForm.title}
                    onChange={(e) =>
                      setBroadcastForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter notification title"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Type</Label>
                  <Select
                    value={broadcastForm.type}
                    onValueChange={(value) =>
                      setBroadcastForm((prev) => ({
                        ...prev,
                        type: value as NotificationType,
                      }))
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Message</Label>
                <Textarea
                  value={broadcastForm.message}
                  onChange={(e) =>
                    setBroadcastForm((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter notification message"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Priority</Label>
                  <Select
                    value={broadcastForm.priority}
                    onValueChange={(value) =>
                      setBroadcastForm((prev) => ({
                        ...prev,
                        priority: value as NotificationPriority,
                      }))
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Target Audience</Label>
                  <Select
                    value={broadcastForm.target}
                    onValueChange={(value) =>
                      setBroadcastForm((prev) => ({
                        ...prev,
                        target: value as "all" | "active" | "custom",
                      }))
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active Users</SelectItem>
                      <SelectItem value="custom">Custom List</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Action URL (Optional)</Label>
                  <Input
                    value={broadcastForm.action_url}
                    onChange={(e) =>
                      setBroadcastForm((prev) => ({
                        ...prev,
                        action_url: e.target.value,
                      }))
                    }
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleBroadcast}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Broadcast
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              Notification Templates
            </h2>
            <Dialog
              open={isTemplateDialogOpen}
              onOpenChange={setIsTemplateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingTemplate ? "Edit Template" : "Create Template"}
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Create reusable notification templates with variables
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Template Name</Label>
                    <Input
                      value={templateForm.name}
                      onChange={(e) =>
                        setTemplateForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="welcome_new_user"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Title</Label>
                    <Input
                      value={templateForm.title}
                      onChange={(e) =>
                        setTemplateForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Welcome {{user_name}}!"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Message</Label>
                    <Textarea
                      value={templateForm.message}
                      onChange={(e) =>
                        setTemplateForm((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Hi {{user_name}}, welcome to FlickPick!"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Type</Label>
                      <Select
                        value={templateForm.type}
                        onValueChange={(value) =>
                          setTemplateForm((prev) => ({
                            ...prev,
                            type: value as NotificationType,
                          }))
                        }
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="announcement">
                            Announcement
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Priority</Label>
                      <Select
                        value={templateForm.priority}
                        onValueChange={(value) =>
                          setTemplateForm((prev) => ({
                            ...prev,
                            priority: value as NotificationPriority,
                          }))
                        }
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={templateForm.is_active}
                      onCheckedChange={(checked) =>
                        setTemplateForm((prev) => ({
                          ...prev,
                          is_active: checked,
                        }))
                      }
                    />
                    <Label className="text-white">Template is active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsTemplateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateTemplate}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {editingTemplate ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">
                          {template.name}
                        </h3>
                        <Badge
                          variant={template.is_active ? "default" : "secondary"}
                        >
                          {template.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">{template.title}</p>
                      <p className="text-xs text-gray-500">
                        {template.message}
                      </p>
                      {template.variables.length > 0 && (
                        <div className="flex gap-1">
                          <span className="text-xs text-gray-500">
                            Variables:
                          </span>
                          {template.variables.map((variable) => (
                            <code
                              key={variable}
                              className="text-xs bg-gray-700 px-1 rounded text-blue-400"
                            >
                              {`{{${variable}}}`}
                            </code>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-400 border-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled" className="space-y-6">
          <h2 className="text-xl font-bold text-white">
            Scheduled Notifications
          </h2>

          <div className="grid gap-4">
            {scheduledNotifications.map((notification) => (
              <Card
                key={notification.id}
                className="bg-gray-800 border-gray-700"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">
                          {notification.title}
                        </h3>
                        <Badge
                          variant={
                            notification.status === "pending"
                              ? "default"
                              : notification.status === "sent"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {notification.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(
                            notification.scheduled_for,
                          ).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {notification.priority} priority
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-400 border-red-400"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Delivery Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Open Rate</span>
                    <span className="text-white font-medium">
                      {stats.openRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Click Rate</span>
                    <span className="text-white font-medium">
                      {stats.clickRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Delivery Rate</span>
                    <span className="text-white font-medium">96.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Unsubscribe Rate</span>
                    <span className="text-white font-medium">0.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="text-gray-400 capitalize">
                          {activity.type.replace("_", " ")}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {activity.count}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
