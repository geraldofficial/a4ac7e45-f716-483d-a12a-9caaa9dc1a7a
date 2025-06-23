import React, { useState, useEffect } from "react";
import {
  Users,
  Film,
  DollarSign,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  adminService,
  AdminStats,
  AdminUser,
  AdminPost,
  AdminComment,
} from "@/services/admin";
import { formatError } from "@/lib/utils";
import { toast } from "sonner";

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
}

export const EnhancedAdminDashboard: React.FC = () => {
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
  });

  const [loading, setLoading] = useState(true);
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

  const fetchStats = async () => {
    try {
      const statsData = await adminService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching stats:", formatError(error));
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await adminService.getUsers(1, 100);
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", formatError(error));
    }
  };

  const fetchPosts = async () => {
    try {
      const postsData = await adminService.getPosts(1, 100);
      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching posts:", formatError(error));
    }
  };

  const fetchComments = async () => {
    try {
      const commentsData = await adminService.getComments(1, 100);
      setComments(commentsData);
    } catch (error) {
      console.error("Error fetching comments:", formatError(error));
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
    // Mock real-time system metrics
    setSystemMetrics((prev) => ({
      ...prev,
      apiResponseTime: Math.floor(Math.random() * 50) + 100,
      activeConnections: Math.floor(Math.random() * 100) + 200,
      bandwidthUsed: Math.random() * 2 + 2,
      errorRate: Math.random() * 0.05,
    }));
  };

  const sendNotification = async () => {
    try {
      const notification: Notification = {
        id: Date.now().toString(),
        ...newNotification,
        sent: false,
        created_at: new Date().toISOString(),
      };

      // Here you would call your notification service
      setNotifications((prev) => [notification, ...prev]);
      setNewNotification({
        title: "",
        message: "",
        type: "info",
        targetUsers: "all",
        scheduledAt: "",
      });

      toast.success("Notification sent successfully!");
    } catch (error) {
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
      active: "default",
      inactive: "secondary",
      pending: "destructive",
      healthy: "default",
      warning: "destructive",
      error: "destructive",
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
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.profiles?.username || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
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
      <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src="https://cdn.builder.io/api/v1/assets/3a5e046f24294e60a3c1afd0f4c614eb/chatgpt-image-jun-21-2025-03_27_04-pm-65410f?format=webp&width=800"
            alt="FlickPick"
            className="h-10 w-auto"
          />
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">Complete platform management</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="border-green-600 text-green-400">
            <Activity className="h-3 w-3 mr-1" />
            System Healthy
          </Badge>
          <Button variant="outline" className="border-gray-700 text-gray-300">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-gray-800 bg-gray-900/50 hover:bg-gray-900/70 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-green-400">
              +{stats.newUsersToday} today
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 hover:bg-gray-900/70 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Active Users
            </CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.activeUsers.toLocaleString()}
            </div>
            <p className="text-xs text-blue-400">
              {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
              active
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 hover:bg-gray-900/70 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total Posts
            </CardTitle>
            <FileText className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalPosts.toLocaleString()}
            </div>
            <p className="text-xs text-green-400">+{stats.postsToday} today</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 hover:bg-gray-900/70 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Engagement
            </CardTitle>
            <Heart className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalLikes.toLocaleString()}
            </div>
            <p className="text-xs text-yellow-400">
              {stats.totalComments} comments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart className="h-5 w-5 mr-2" />
            System Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-400">
                {systemMetrics.apiResponseTime}ms
              </div>
              <div className="text-xs text-gray-400">API Response</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-400">
                {systemMetrics.activeConnections}
              </div>
              <div className="text-xs text-gray-400">Active Connections</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-400">
                {systemMetrics.bandwidthUsed.toFixed(1)} GB
              </div>
              <div className="text-xs text-gray-400">Bandwidth Used</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-400">
                {(systemMetrics.errorRate * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-gray-400">Error Rate</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Storage Used</span>
              <span>
                {systemMetrics.storageUsed}/{systemMetrics.storageTotal} GB
              </span>
            </div>
            <Progress
              value={
                (systemMetrics.storageUsed / systemMetrics.storageTotal) * 100
              }
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-6 bg-gray-900 border-gray-800">
          <TabsTrigger
            value="overview"
            className="text-gray-300 data-[state=active]:text-white"
          >
            <Eye className="h-4 w-4 mr-1" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="text-gray-300 data-[state=active]:text-white"
          >
            <Users className="h-4 w-4 mr-1" />
            Users
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="text-gray-300 data-[state=active]:text-white"
          >
            <Film className="h-4 w-4 mr-1" />
            Content
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="text-gray-300 data-[state=active]:text-white"
          >
            <Bell className="h-4 w-4 mr-1" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="text-gray-300 data-[state=active]:text-white"
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="text-gray-300 data-[state=active]:text-white"
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.slice(0, 5).map((post) => (
                    <div key={post.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          New post created
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {post.content.substring(0, 50)}...
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(post.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Users */}
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white">Top Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profiles?.avatar} />
                        <AvatarFallback>
                          {user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          {user.profiles?.full_name ||
                            user.profiles?.username ||
                            "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {user.last_sign_in_at ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">User Management</CardTitle>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 bg-gray-800 border-gray-700 text-white"
                  />
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Email</TableHead>
                    <TableHead className="text-gray-300">Last Active</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-gray-800">
                      <TableCell className="text-white">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profiles?.avatar} />
                            <AvatarFallback>
                              {user.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.profiles?.full_name ||
                                user.profiles?.username ||
                                "Anonymous"}
                            </div>
                            <div className="text-sm text-gray-400">
                              ID: {user.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-gray-300">
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
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-400 border-blue-400/50"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-400 border-red-400/50"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Content Management</CardTitle>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 bg-gray-800 border-gray-700 text-white"
                  />
                  <Select
                    value={contentFilter}
                    onValueChange={setContentFilter}
                  >
                    <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
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
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-300">Content</TableHead>
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Engagement</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id} className="border-gray-800">
                      <TableCell className="text-white max-w-xs">
                        <div className="truncate">{post.content}</div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {post.user_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Heart className="h-3 w-3 mr-1 text-red-400" />
                            {post.likes_count}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="h-3 w-3 mr-1 text-blue-400" />
                            {post.comments_count}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {formatDate(post.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-400 border-blue-400/50"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-400 border-red-400/50"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Send New Notification */}
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Send className="h-5 w-5 mr-2" />
                  Send Notification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Title</Label>
                  <Input
                    placeholder="Notification title"
                    value={newNotification.title}
                    onChange={(e) =>
                      setNewNotification((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Message</Label>
                  <Textarea
                    placeholder="Notification message"
                    value={newNotification.message}
                    onChange={(e) =>
                      setNewNotification((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    className="bg-gray-800 border-gray-700 text-white"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Type</Label>
                    <Select
                      value={newNotification.type}
                      onValueChange={(value: any) =>
                        setNewNotification((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
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
                    <Label className="text-gray-300">Target</Label>
                    <Select
                      value={newNotification.targetUsers}
                      onValueChange={(value: any) =>
                        setNewNotification((prev) => ({
                          ...prev,
                          targetUsers: value,
                        }))
                      }
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
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
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={!newNotification.title || !newNotification.message}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
              </CardContent>
            </Card>

            {/* Notification History */}
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white">
                  Notification History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 border border-gray-700 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-white">
                          {notification.title}
                        </h4>
                        <Badge
                          variant={
                            notification.type === "error"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {notification.type}
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">
                        {notification.message}
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>Target: {notification.targetUsers}</span>
                        <span>{formatDate(notification.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white">User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">This Month</span>
                    <span className="text-green-400">
                      +{stats.newUsersThisMonth}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">This Week</span>
                    <span className="text-blue-400">
                      +{stats.newUsersThisWeek}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Today</span>
                    <span className="text-purple-400">
                      +{stats.newUsersToday}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white">Content Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Posts This Month</span>
                    <span className="text-green-400">
                      {stats.postsThisMonth}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Posts This Week</span>
                    <span className="text-blue-400">{stats.postsThisWeek}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Posts Today</span>
                    <span className="text-purple-400">{stats.postsToday}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white">Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Likes</span>
                    <span className="text-red-400">{stats.totalLikes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Comments</span>
                    <span className="text-blue-400">{stats.totalComments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg. per Post</span>
                    <span className="text-green-400">
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

        <TabsContent value="settings" className="space-y-6">
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-white">Platform Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">General</h3>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Maintenance Mode</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">User Registration</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Email Notifications</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Security</h3>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Two-Factor Auth</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Rate Limiting</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Content Moderation</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
