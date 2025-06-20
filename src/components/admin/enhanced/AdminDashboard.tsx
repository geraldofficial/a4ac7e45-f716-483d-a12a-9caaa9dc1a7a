import React, { useState, useEffect } from 'react';
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
  MessageCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { adminService, AdminStats, AdminUser, AdminPost, AdminComment } from '@/services/admin';
import { formatError } from '@/lib/utils';
import { toast } from 'sonner';

// Using interfaces from admin service

export const AdminDashboard: React.FC = () => {
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchPosts(),
        fetchComments(),
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
      console.error('Error fetching stats:', formatError(error));
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await adminService.getUsers(10);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', formatError(error));
    }
  };

  const fetchPosts = async () => {
    try {
      const postsData = await adminService.getPosts(10);
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', formatError(error));
    }
  };

  const fetchComments = async () => {
    try {
      const commentsData = await adminService.getComments(10);
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', formatError(error));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      pending: 'secondary',
      disabled: 'destructive',
      completed: 'default',
      failed: 'destructive',
    } as const;

    const icons = {
      active: CheckCircle,
      pending: AlertTriangle,
      disabled: XCircle,
      completed: CheckCircle,
      failed: XCircle,
    };

    const Icon = icons[status as keyof typeof icons];

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-300 rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-300 rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400">Overview of your FlickPick platform</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="border-gray-700 text-gray-300">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" className="border-gray-700 text-gray-300">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-green-400">
              +{stats.newUsersToday} today
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-gray-400">
              {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Posts</CardTitle>
            <MessageCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalPosts.toLocaleString()}</div>
            <p className="text-xs text-green-400">
              +{stats.postsToday} today
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Community Activity</CardTitle>
            <Film className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalComments.toLocaleString()}</div>
            <p className="text-xs text-gray-400">
              {stats.totalLikes.toLocaleString()} total likes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-gray-900 border-gray-800">
          <TabsTrigger value="overview" className="text-gray-300 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="text-gray-300 data-[state=active]:text-white">
            Users
          </TabsTrigger>
          <TabsTrigger value="posts" className="text-gray-300 data-[state=active]:text-white">
            Posts
          </TabsTrigger>
          <TabsTrigger value="comments" className="text-gray-300 data-[state=active]:text-white">
            Comments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white">User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">New Users</span>
                    <span className="text-sm text-white">{stats.newUsersToday}</span>
                  </div>
                  <Progress value={75} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Active Users</span>
                    <span className="text-sm text-white">{stats.activeUsers}</span>
                  </div>
                  <Progress value={60} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Conversion Rate</span>
                    <span className="text-sm text-white">{stats.conversionRate}%</span>
                  </div>
                  <Progress value={stats.conversionRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Community Activity Chart */}
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white">Community Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-white">
                    {stats.postsThisMonth.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-400">Posts this month</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Today</span>
                      <span className="text-white">{stats.postsToday} posts</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">This Week</span>
                      <span className="text-white">{stats.postsThisWeek} posts</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Comments</span>
                      <span className="text-white">{stats.totalComments.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-white">Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Joined</TableHead>
                    <TableHead className="text-gray-300">Last Active</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-gray-800">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.profiles?.avatar} />
                            <AvatarFallback>
                              {user.profiles?.username?.[0] || user.email?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-white">
                              {user.profiles?.full_name || user.profiles?.username || 'Anonymous'}
                            </div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {user.last_sign_in_at
                          ? formatDate(user.last_sign_in_at)
                          : "Not available"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge('active')}
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
              <CardTitle className="text-white">Content Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-300">Title</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Views</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {content.map((item) => (
                    <TableRow key={item.id} className="border-gray-800">
                      <TableCell className="font-medium text-white">{item.title}</TableCell>
                      <TableCell className="text-gray-300">{item.type}</TableCell>
                      <TableCell className="text-gray-300">{item.views.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-gray-300">{formatDate(item.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id} className="border-gray-800">
                      <TableCell className="text-white">{post.content}</TableCell>
                      <TableCell className="text-gray-300">{post.user_id}</TableCell>
                      <TableCell className="text-gray-300">{post.likes_count} likes</TableCell>
                      <TableCell className="text-gray-300">{post.comments_count} comments</TableCell>
                      <TableCell className="text-gray-300">
                        {formatDate(post.created_at)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
    </div>
  );
};