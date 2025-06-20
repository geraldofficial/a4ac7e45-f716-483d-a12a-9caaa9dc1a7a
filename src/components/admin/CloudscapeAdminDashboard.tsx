import React, { useState, useEffect } from "react";
import {
  Users,
  Film,
  TrendingUp,
  Eye,
  Calendar,
  Download,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageCircle,
  Bell,
  Send,
  Trash2,
  Edit,
  Search,
  Filter,
  BarChart,
  Activity,
  Globe,
  Lock,
  UserPlus,
  FileText,
  Star,
  Heart,
  Play,
  RefreshCw,
  Database,
  Server,
  Wifi,
  HardDrive,
  Cpu,
  MoreHorizontal,
  Plus,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  adminService,
  AdminStats,
  AdminUser,
  AdminPost,
  AdminComment,
} from "@/services/admin";
import { formatError } from "@/lib/utils";
import { toast } from "sonner";
import { realNotificationsService } from "@/services/realNotifications";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  targetUsers: "all" | "active" | "premium" | "specific";
  specificUsers?: string[];
  scheduledAt?: string;
  sent: boolean;
  created_at: string;
}

interface SystemMetrics {
  serverUptime: string;
  databaseStatus: "healthy" | "warning" | "error";
  apiResponseTime: number;
  activeConnections: number;
  storageUsed: number;
  storageTotal: number;
  bandwidthUsed: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
}

export const CloudscapeAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    postsToday: 0,
    postsThisWeek: 0,
    postsThisMonth: 0,
  });

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    serverUptime: "7d 12h 30m",
    databaseStatus: "healthy",
    apiResponseTime: 120,
    activeConnections: 245,
    storageUsed: 750,
    storageTotal: 1000,
    bandwidthUsed: 2.4,
    errorRate: 0.02,
    cpuUsage: 45,
    memoryUsage: 62,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [contentFilter, setContentFilter] = useState("all");

  // Notification form state
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "info" as const,
    targetUsers: "all" as const,
    scheduledAt: "",
  });

  useEffect(() => {
    fetchDashboardData();
    // Set up real-time updates
    const interval = setInterval(fetchSystemMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchPosts(),
        fetchComments(),
        fetchNotifications(),
        fetchSystemMetrics(),
      ]);
    } catch (error) {
      toast.error(`Failed to load dashboard data: ${formatError(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await fetchDashboardData();
      toast.success("Dashboard data refreshed");
    } catch (error) {
      toast.error(`Failed to refresh data: ${formatError(error)}`);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await adminService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching stats:", formatError(error));
      toast.error("Failed to fetch statistics");
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await adminService.getUsers(1, 100);
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", formatError(error));
      toast.error("Failed to fetch users");
    }
  };

  const fetchPosts = async () => {
    try {
      const postsData = await adminService.getPosts(1, 100);
      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching posts:", formatError(error));
      toast.error("Failed to fetch posts");
    }
  };

  const fetchComments = async () => {
    try {
      const commentsData = await adminService.getComments(1, 100);
      setComments(commentsData);
    } catch (error) {
      console.error("Error fetching comments:", formatError(error));
      toast.error("Failed to fetch comments");
    }
  };

  const fetchNotifications = async () => {
    // Mock data for notifications
    setNotifications([
      {
        id: "1",
        title: "Welcome to FlickPick!",
        message: "Thanks for joining our community",
        type: "success",
        targetUsers: "all",
        sent: true,
        created_at: new Date().toISOString(),
      },
    ]);
  };

  const fetchSystemMetrics = async () => {
    // Mock real-time system metrics with more realistic updates
    setSystemMetrics((prev) => ({
      ...prev,
      apiResponseTime: Math.floor(Math.random() * 50) + 100,
      activeConnections: Math.floor(Math.random() * 100) + 200,
      bandwidthUsed: Math.random() * 2 + 2,
      errorRate: Math.random() * 0.05,
      cpuUsage: Math.floor(Math.random() * 20) + 35,
      memoryUsage: Math.floor(Math.random() * 15) + 55,
    }));
  };

  const sendNotification = async () => {
    try {
      if (!newNotification.title || !newNotification.message) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Get target user IDs based on selection
      let targetUserIds: string[] = [];

      if (newNotification.targetUsers === "all") {
        targetUserIds = users.map(user => user.id);
      } else if (newNotification.targetUsers === "active") {
        targetUserIds = users.filter(user => user.last_sign_in_at).map(user => user.id);
      } else {
        // For now, send to all users if no specific targeting
        targetUserIds = users.map(user => user.id);
      }

      if (targetUserIds.length === 0) {
        toast.error("No target users found");
        return;
      }

      // Send bulk notification using real service
      await realNotificationsService.sendBulkNotification(targetUserIds, {
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type as any,
        priority: "medium",
      });

      // Add to local notifications list for display
      const notification: Notification = {
        id: Date.now().toString(),
        ...newNotification,
        sent: true,
        created_at: new Date().toISOString(),
      };

      setNotifications((prev) => [notification, ...prev]);
      setNewNotification({
        title: "",
        message: "",
        type: "info",
        targetUsers: "all",
        scheduledAt: "",
      });

      toast.success(`Notification sent to ${targetUserIds.length} users!`);
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error(`Failed to send notification: ${formatError(error)}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminService.deleteUser(userId);
      toast.success("User deleted successfully");
      await fetchUsers();
    } catch (error) {
      toast.error(`Failed to delete user: ${formatError(error)}`);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await adminService.deletePost(postId);
      toast.success("Post deleted successfully");
      await fetchPosts();
    } catch (error) {
      toast.error(`Failed to delete post: ${formatError(error)}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      healthy: "bg-green-100 text-green-800 border-green-200",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      error: "bg-red-100 text-red-800 border-red-200",
    } as const;

    const icons = {
      active: CheckCircle,
      inactive: XCircle,
      pending: AlertTriangle,
      healthy: CheckCircle,
      warning: AlertTriangle,
      error: XCircle,
    } as const;

    const Icon = icons[status as keyof typeof icons] || CheckCircle;

    return (
      <Badge className={`${variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"} border`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getMetricStatus = (value: number, threshold: number) => {
    if (value < threshold * 0.6) return { color: "text-green-600", bg: "bg-green-100" };
    if (value < threshold * 0.8) return { color: "text-yellow-600", bg: "bg-yellow-100" };
    return { color: "text-red-600", bg: "bg-red-100" };
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter =
      userFilter === "all" ||
      (userFilter === "active" && user.last_sign_in_at) ||
      (userFilter === "inactive" && !user.last_sign_in_at);
    return matchesSearch && matchesFilter;
  });

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.content
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      contentFilter === "all" ||
      (contentFilter === "recent" &&
        new Date(post.created_at) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (contentFilter === "popular" && post.likes_count > 5);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">FlickPick Admin</h1>
                <p className="text-sm text-slate-600">System management console</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <Activity className="h-3 w-3 mr-1" />
              System Operational
            </Badge>
            <Button
              variant="outline"
              onClick={refreshData}
              disabled={refreshing}
              className="border-slate-300"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* System Status Banner */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">All systems operational</span>
                </div>
                <Separator orientation="vertical" className="h-6 bg-blue-500" />
                <div className="text-sm opacity-90">
                  Uptime: {systemMetrics.serverUptime}
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-lg font-semibold">{systemMetrics.activeConnections}</div>
                  <div className="text-xs opacity-75">Active Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{systemMetrics.apiResponseTime}ms</div>
                  <div className="text-xs opacity-75">Response Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Total Users</CardTitle>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {stats.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{stats.newUsersToday} today
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Active Users</CardTitle>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {stats.activeUsers.toLocaleString()}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Content Posts</CardTitle>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {stats.totalPosts.toLocaleString()}
              </div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{stats.postsToday} today
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Engagement</CardTitle>
              <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {stats.totalLikes.toLocaleString()}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {stats.totalComments} comments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center">
                <Server className="h-5 w-5 mr-2 text-slate-600" />
                System Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">CPU Usage</span>
                    <span className={`font-medium ${getMetricStatus(systemMetrics.cpuUsage, 100).color}`}>
                      {systemMetrics.cpuUsage}%
                    </span>
                  </div>
                  <Progress
                    value={systemMetrics.cpuUsage}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Memory Usage</span>
                    <span className={`font-medium ${getMetricStatus(systemMetrics.memoryUsage, 100).color}`}>
                      {systemMetrics.memoryUsage}%
                    </span>
                  </div>
                  <Progress
                    value={systemMetrics.memoryUsage}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Storage</span>
                    <span className="font-medium text-slate-900">
                      {systemMetrics.storageUsed}/{systemMetrics.storageTotal} GB
                    </span>
                  </div>
                  <Progress
                    value={(systemMetrics.storageUsed / systemMetrics.storageTotal) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-slate-600" />
                Network & Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-lg font-semibold text-slate-900">{systemMetrics.apiResponseTime}ms</div>
                  <div className="text-xs text-slate-600">API Response</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-lg font-semibold text-slate-900">{systemMetrics.activeConnections}</div>
                  <div className="text-xs text-slate-600">Connections</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-lg font-semibold text-slate-900">{systemMetrics.bandwidthUsed.toFixed(1)} GB</div>
                  <div className="text-xs text-slate-600">Bandwidth</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-lg font-semibold text-slate-900">{(systemMetrics.errorRate * 100).toFixed(2)}%</div>
                  <div className="text-xs text-slate-600">Error Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-slate-200">
              <TabsList className="grid w-full grid-cols-6 bg-transparent h-auto p-0">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none py-4"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none py-4"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Users ({users.length})
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none py-4"
                >
                  <Film className="h-4 w-4 mr-2" />
                  Content ({posts.length})
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none py-4"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none py-4"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none py-4"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="overview" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            <Button
              variant="outline"
              onClick={refreshData}
              disabled={refreshing}
              className="border-slate-300"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setActiveTab("settings");
                toast.success("Navigated to settings");
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-purple-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900">New post created</p>
                            <p className="text-xs text-slate-600 truncate">
                              {post.content.substring(0, 50)}...
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {formatDate(post.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Users */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">Most Active Users</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600"
                        onClick={() => {
                          setActiveTab("users");
                          toast.success("Showing all users");
                        }}
                      >
                        View all
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {users.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {(user.email || user.username || "U").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {user.full_name || user.username || "Anonymous"}
                            </p>
                            <p className="text-xs text-slate-600 truncate">
                              {user.email}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-slate-900">{user.post_count} posts</p>
                            <p className="text-xs text-slate-600">{user.like_count} likes</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="users" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">User Management</h3>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64 border-slate-300"
                        />
                      </div>
                      <Select value={userFilter} onValueChange={setUserFilter}>
                        <SelectTrigger className="w-32 border-slate-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600"
                        onClick={() => {
                          setActiveTab("users");
                          toast.success("Showing all users");
                        }}
                      >
                        View all
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {users.slice(0, 5).map((user) => (
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="text-slate-700 font-medium">User</TableHead>
                          <TableHead className="text-slate-700 font-medium">Email</TableHead>
                          <TableHead className="text-slate-700 font-medium">Activity</TableHead>
                          <TableHead className="text-slate-700 font-medium">Last Active</TableHead>
                          <TableHead className="text-slate-700 font-medium">Status</TableHead>
                          <TableHead className="text-slate-700 font-medium">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-slate-50">
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback className="bg-blue-100 text-blue-600">
                                    {(user.email || user.username || "U").charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-slate-900">
                                    {user.full_name || user.username || "Anonymous"}
                                  </div>
                                  <div className="text-sm text-slate-500">
                                    ID: {user.id.substring(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-700">
                              {user.email || "No email"}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-slate-700">
                                <div>{user.post_count} posts</div>
                                <div className="text-slate-500">{user.like_count} likes</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-700">
                              {user.last_sign_in_at
                                ? formatDate(user.last_sign_in_at)
                                : "Never"}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(
                                user.last_sign_in_at ? "active" : "inactive",
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="h-3 w-3 mr-2" />
                                    Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Eye className="h-3 w-3 mr-2" />
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Content Management</h3>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search content..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64 border-slate-300"
                        />
                      </div>
                      <Select value={contentFilter} onValueChange={setContentFilter}>
                        <SelectTrigger className="w-32 border-slate-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Posts</SelectItem>
                          <SelectItem value="recent">Recent</SelectItem>
                          <SelectItem value="popular">Popular</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="text-slate-700 font-medium">Content</TableHead>
                          <TableHead className="text-slate-700 font-medium">Author</TableHead>
                          <TableHead className="text-slate-700 font-medium">Engagement</TableHead>
                          <TableHead className="text-slate-700 font-medium">Date</TableHead>
                          <TableHead className="text-slate-700 font-medium">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPosts.map((post) => (
                          <TableRow key={post.id} className="hover:bg-slate-50">
                            <TableCell className="max-w-xs">
                              <div className="truncate text-slate-900">{post.content}</div>
                              {post.has_media && (
                                <Badge className="mt-1 bg-purple-100 text-purple-800 border-purple-200">
                                  Has Media
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={post.author.avatar} />
                                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                    {post.author.username.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-slate-700">{post.author.username}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="flex items-center text-red-600">
                                  <Heart className="h-3 w-3 mr-1" />
                                  {post.likes_count}
                                </span>
                                <span className="flex items-center text-blue-600">
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  {post.comments_count}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-700">
                              {formatDate(post.created_at)}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-3 w-3 mr-2" />
                                    View Post
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="h-3 w-3 mr-2" />
                                    Edit Post
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeletePost(post.id)}
                                  >
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    Delete Post
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Send New Notification */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Send Notification</h3>
                    <div className="space-y-4 p-6 border border-slate-200 rounded-lg bg-slate-50">
                      <div>
                        <Label className="text-slate-700 font-medium">Title</Label>
                        <Input
                          placeholder="Notification title"
                          value={newNotification.title}
                          onChange={(e) =>
                            setNewNotification((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="mt-1 border-slate-300"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-700 font-medium">Message</Label>
                        <Textarea
                          placeholder="Notification message"
                          value={newNotification.message}
                          onChange={(e) =>
                            setNewNotification((prev) => ({
                              ...prev,
                              message: e.target.value,
                            }))
                          }
                          className="mt-1 border-slate-300"
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-slate-700 font-medium">Type</Label>
                          <Select
                            value={newNotification.type}
                            onValueChange={(value: any) =>
                              setNewNotification((prev) => ({ ...prev, type: value }))
                            }
                          >
                            <SelectTrigger className="mt-1 border-slate-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="info">Info</SelectItem>
                              <SelectItem value="success">Success</SelectItem>
                              <SelectItem value="warning">Warning</SelectItem>
                              <SelectItem value="error">Error</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-slate-700 font-medium">Target</Label>
                          <Select
                            value={newNotification.targetUsers}
                            onValueChange={(value: any) =>
                              setNewNotification((prev) => ({
                                ...prev,
                                targetUsers: value,
                              }))
                            }
                          >
                            <SelectTrigger className="mt-1 border-slate-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Users</SelectItem>
                              <SelectItem value="active">Active Users</SelectItem>
                              <SelectItem value="premium">Premium Users</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        onClick={sendNotification}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={!newNotification.title || !newNotification.message}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Notification
                      </Button>
                    </div>
                  </div>

                  {/* Notification History */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Notifications</h3>
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 border border-slate-200 rounded-lg bg-white"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-slate-900">
                              {notification.title}
                            </h4>
                            <Badge className={
                              notification.type === "error"
                                ? "bg-red-100 text-red-800 border-red-200"
                                : notification.type === "warning"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : notification.type === "success"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            }>
                              {notification.type}
                            </Badge>
                          </div>
                          <p className="text-slate-700 text-sm mb-2">
                            {notification.message}
                          </p>
                          <div className="flex justify-between items-center text-xs text-slate-500">
                            <span>Target: {notification.targetUsers}</span>
                            <span>{formatDate(notification.created_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="border-slate-200 bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-slate-900">User Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">This Month</span>
                          <span className="font-semibold text-green-600">
                            +{stats.newUsersThisMonth}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">This Week</span>
                          <span className="font-semibold text-blue-600">
                            +{stats.newUsersThisWeek}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Today</span>
                          <span className="font-semibold text-purple-600">
                            +{stats.newUsersToday}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-slate-900">Content Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Posts This Month</span>
                          <span className="font-semibold text-green-600">
                            {stats.postsThisMonth}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Posts This Week</span>
                          <span className="font-semibold text-blue-600">{stats.postsThisWeek}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Posts Today</span>
                          <span className="font-semibold text-purple-600">{stats.postsToday}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-slate-900">Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Total Likes</span>
                          <span className="font-semibold text-red-600">{stats.totalLikes}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Total Comments</span>
                          <span className="font-semibold text-blue-600">{stats.totalComments}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Avg. per Post</span>
                          <span className="font-semibold text-green-600">
                            {(
                              stats.totalLikes / Math.max(stats.totalPosts, 1)
                            ).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Platform Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 p-6 border border-slate-200 rounded-lg bg-slate-50">
                        <h4 className="font-medium text-slate-900">General Settings</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-slate-700">Maintenance Mode</Label>
                            <Switch
                              onCheckedChange={(checked) => {
                                toast.success(checked ? "Maintenance mode enabled" : "Maintenance mode disabled");
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-slate-700">User Registration</Label>
                            <Switch
                              defaultChecked
                              onCheckedChange={(checked) => {
                                toast.success(checked ? "User registration enabled" : "User registration disabled");
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-slate-700">Email Notifications</Label>
                            <Switch
                              defaultChecked
                              onCheckedChange={(checked) => {
                                toast.success(checked ? "Email notifications enabled" : "Email notifications disabled");
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4 p-6 border border-slate-200 rounded-lg bg-slate-50">
                        <h4 className="font-medium text-slate-900">Security Settings</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-slate-700">Two-Factor Auth</Label>
                            <Switch
                              defaultChecked
                              onCheckedChange={(checked) => {
                                toast.success(checked ? "Two-factor authentication enabled" : "Two-factor authentication disabled");
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-slate-700">Rate Limiting</Label>
                            <Switch
                              defaultChecked
                              onCheckedChange={(checked) => {
                                toast.success(checked ? "Rate limiting enabled" : "Rate limiting disabled");
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-slate-700">Content Moderation</Label>
                            <Switch
                              defaultChecked
                              onCheckedChange={(checked) => {
                                toast.success(checked ? "Content moderation enabled" : "Content moderation disabled");
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};