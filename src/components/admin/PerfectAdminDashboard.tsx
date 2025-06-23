import React, { useState, useEffect } from "react";
import {
  Users,
  MessageSquare,
  Heart,
  TrendingUp,
  Search,
  Trash2,
  Settings,
  Shield,
  Database,
  Activity,
  LogOut,
  RefreshCw,
  Eye,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  adminService,
  AdminStats,
  AdminUser,
  AdminPost,
  AdminComment,
} from "@/services/admin";
import AdminSettings from "./AdminSettings";
import { formatError } from "@/lib/utils";
import { toast } from "sonner";

interface PerfectAdminDashboardProps {
  onSignOut: () => void;
}

export const PerfectAdminDashboard: React.FC<PerfectAdminDashboardProps> = ({
  onSignOut,
}) => {
  // State
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search states
  const [userSearch, setUserSearch] = useState("");
  const [postSearch, setPostSearch] = useState("");

  // Pagination
  const [userPage, setUserPage] = useState(0);
  const [postPage, setPostPage] = useState(0);
  const [commentPage, setCommentPage] = useState(0);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadUsers(),
        loadPosts(),
        loadComments(),
      ]);
    } catch (error) {
      toast.error("Failed to load admin data");
      console.error("Admin data loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await adminService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", formatError(error));
      toast.error("Failed to load statistics");
    }
  };

  const loadUsers = async (search?: string, page: number = 0) => {
    try {
      const usersData = search
        ? await adminService.searchUsers(
            search,
            ITEMS_PER_PAGE,
            page * ITEMS_PER_PAGE,
          )
        : await adminService.getUsers(ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

      if (page === 0) {
        setUsers(usersData);
      } else {
        setUsers((prev) => [...prev, ...usersData]);
      }
    } catch (error) {
      console.error("Error loading users:", formatError(error));
      toast.error("Failed to load users");
    }
  };

  const loadPosts = async (search?: string, page: number = 0) => {
    try {
      const postsData = search
        ? await adminService.searchPosts(
            search,
            ITEMS_PER_PAGE,
            page * ITEMS_PER_PAGE,
          )
        : await adminService.getPosts(ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

      if (page === 0) {
        setPosts(postsData);
      } else {
        setPosts((prev) => [...prev, ...postsData]);
      }
    } catch (error) {
      console.error("Error loading posts:", formatError(error));
      toast.error("Failed to load posts");
    }
  };

  const loadComments = async (page: number = 0) => {
    try {
      const commentsData = await adminService.getComments(
        ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE,
      );

      if (page === 0) {
        setComments(commentsData);
      } else {
        setComments((prev) => [...prev, ...commentsData]);
      }
    } catch (error) {
      console.error("Error loading comments:", formatError(error));
      toast.error("Failed to load comments");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAllData();
      toast.success("Data refreshed successfully");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
      await loadStats(); // Refresh stats
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error(`Failed to delete user: ${formatError(error)}`);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await adminService.deletePost(postId);
      setPosts(posts.filter((p) => p.id !== postId));
      await loadStats(); // Refresh stats
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error(`Failed to delete post: ${formatError(error)}`);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await adminService.deleteComment(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
      await loadStats(); // Refresh stats
      toast.success("Comment deleted successfully");
    } catch (error) {
      toast.error(`Failed to delete comment: ${formatError(error)}`);
    }
  };

  const handleUserSearch = async () => {
    setUserPage(0);
    await loadUsers(userSearch.trim() || undefined, 0);
  };

  const handlePostSearch = async () => {
    setPostPage(0);
    await loadPosts(postSearch.trim() || undefined, 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color = "text-blue-400",
  }: any) => (
    <Card className="border-gray-800 bg-gray-900">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-white">
              {value.toLocaleString()}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4" />
          <p className="text-white">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-red-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  FlickPick Admin
                </h1>
                <p className="text-gray-400">System Administration Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>

              <Button
                onClick={onSignOut}
                variant="outline"
                size="sm"
                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-800 border-gray-700 mb-6">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-red-600"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-red-600"
            >
              <Users className="h-4 w-4 mr-2" />
              Users ({stats.totalUsers})
            </TabsTrigger>
            <TabsTrigger
              value="posts"
              className="data-[state=active]:bg-red-600"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Posts ({stats.totalPosts})
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="data-[state=active]:bg-red-600"
            >
              <Heart className="h-4 w-4 mr-2" />
              Comments ({stats.totalComments})
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-red-600"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Users}
                title="Total Users"
                value={stats.totalUsers}
                subtitle={`${stats.activeUsers} active this week`}
                color="text-blue-400"
              />
              <StatCard
                icon={MessageSquare}
                title="Total Posts"
                value={stats.totalPosts}
                subtitle={`${stats.postsToday} today`}
                color="text-green-400"
              />
              <StatCard
                icon={Heart}
                title="Total Comments"
                value={stats.totalComments}
                subtitle="User engagement"
                color="text-purple-400"
              />
              <StatCard
                icon={TrendingUp}
                title="Total Likes"
                value={stats.totalLikes}
                subtitle="Community activity"
                color="text-red-400"
              />
            </div>

            {/* Growth Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-gray-800 bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-white">User Growth</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Today</span>
                    <Badge
                      variant="outline"
                      className="border-green-600 text-green-400"
                    >
                      +{stats.newUsersToday}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">This Week</span>
                    <Badge
                      variant="outline"
                      className="border-blue-600 text-blue-400"
                    >
                      +{stats.newUsersThisWeek}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">This Month</span>
                    <Badge
                      variant="outline"
                      className="border-purple-600 text-purple-400"
                    >
                      +{stats.newUsersThisMonth}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-800 bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-white">Content Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Posts Today</span>
                    <Badge
                      variant="outline"
                      className="border-green-600 text-green-400"
                    >
                      +{stats.postsToday}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Posts This Week</span>
                    <Badge
                      variant="outline"
                      className="border-blue-600 text-blue-400"
                    >
                      +{stats.postsThisWeek}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Posts This Month</span>
                    <Badge
                      variant="outline"
                      className="border-purple-600 text-purple-400"
                    >
                      +{stats.postsThisMonth}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search users by name or username..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleUserSearch()}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <Button
                    onClick={handleUserSearch}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Card className="border-gray-800 bg-gray-900">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {(user.username ||
                                user.full_name ||
                                "U")[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-white font-medium">
                              {user.full_name || user.username}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              @{user.username}
                            </p>
                            <p className="text-gray-500 text-xs">
                              Joined {formatDate(user.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right text-sm">
                            <p className="text-gray-300">
                              {user.post_count} posts
                            </p>
                            <p className="text-gray-400">
                              {user.comment_count} comments
                            </p>
                          </div>

                          <Button
                            onClick={() => handleDeleteUser(user.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search posts by content..."
                    value={postSearch}
                    onChange={(e) => setPostSearch(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handlePostSearch()}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <Button
                    onClick={handlePostSearch}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Card className="border-gray-800 bg-gray-900">
              <CardHeader>
                <CardTitle className="text-white">Post Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback className="text-xs">
                                  {post.author.username[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-white text-sm font-medium">
                                {post.author.full_name}
                              </span>
                              <span className="text-gray-400 text-xs">
                                {formatDate(post.created_at)}
                              </span>
                            </div>

                            <p className="text-gray-300 text-sm mb-2">
                              {post.content.length > 200
                                ? post.content.substring(0, 200) + "..."
                                : post.content}
                            </p>

                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                              <span>{post.likes_count} likes</span>
                              <span>{post.comments_count} comments</span>
                              {post.has_media && (
                                <Badge variant="outline" className="text-xs">
                                  Media
                                </Badge>
                              )}
                            </div>
                          </div>

                          <Button
                            onClick={() => handleDeletePost(post.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-6">
            <Card className="border-gray-800 bg-gray-900">
              <CardHeader>
                <CardTitle className="text-white">Comment Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-4 bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={comment.author.avatar} />
                                <AvatarFallback className="text-xs">
                                  {comment.author.username[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-white text-sm font-medium">
                                {comment.author.full_name}
                              </span>
                              <span className="text-gray-400 text-xs">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>

                            <p className="text-gray-300 text-sm mb-2">
                              {comment.content}
                            </p>
                            <p className="text-gray-500 text-xs">
                              On post: {comment.post_title}
                            </p>
                          </div>

                          <Button
                            onClick={() => handleDeleteComment(comment.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PerfectAdminDashboard;
