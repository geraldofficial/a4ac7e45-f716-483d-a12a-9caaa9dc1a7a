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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { formatError } from "@/lib/utils";
import { toast } from "sonner";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalContent: number;
  watchTime: number;
  newUsersToday: number;
  conversionRate: number;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string; // Optional since not available from profiles table
  profiles?: {
    username: string;
    full_name: string;
    avatar: string;
  };
}

interface ContentItem {
  id: string;
  title: string;
  type: string;
  status: "active" | "pending" | "disabled";
  views: number;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  created_at: string;
  profiles?: {
    username: string;
    full_name: string;
  };
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalContent: 0,
    watchTime: 0,
    newUsersToday: 0,
    conversionRate: 0,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
        fetchContent(),
        fetchTransactions(),
      ]);
    } catch (error) {
      toast.error(`Failed to load dashboard data: ${formatError(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch user stats
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id, created_at");

      if (usersError) throw usersError;

      // Fetch revenue stats (mock for now)
      const totalUsers = usersData?.length || 0;
      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );

      const newUsersToday =
        usersData?.filter((user) => new Date(user.created_at) >= todayStart)
          .length || 0;

      // Mock active users since we can't access auth.users.last_sign_in_at
      // In production, you'd want to track this in the profiles table or via a separate service
      const activeUsers = Math.floor(totalUsers * 0.6); // Assume 60% are active

      setStats({
        totalUsers,
        activeUsers,
        totalRevenue: 15420.5, // Mock data
        monthlyRevenue: 3240.8, // Mock data
        totalContent: 1250, // Mock data
        watchTime: 45600, // Mock data (minutes)
        newUsersToday,
        conversionRate: 12.5, // Mock data
      });
    } catch (error) {
      console.error("Error fetching stats:", formatError(error));
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          id,
          created_at,
          username,
          full_name,
          avatar
        `,
        )
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Transform data to match User interface
      const transformedUsers =
        data?.map((profile) => ({
          id: profile.id,
          email: "", // Would need to join with auth.users
          created_at: profile.created_at,
          last_sign_in_at: "", // Not available from profiles table
          profiles: {
            username: profile.username,
            full_name: profile.full_name,
            avatar: profile.avatar,
          },
        })) || [];

      setUsers(transformedUsers);
    } catch (error) {
      console.error("Error fetching users:", formatError(error));
    }
  };

  const fetchContent = async () => {
    // Mock content data - replace with actual content table query
    const mockContent: ContentItem[] = [
      {
        id: "1",
        title: "The Matrix",
        type: "Movie",
        status: "active",
        views: 12500,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
      },
      {
        id: "2",
        title: "Breaking Bad S1E1",
        type: "TV Show",
        status: "active",
        views: 8400,
        created_at: "2024-01-14T14:30:00Z",
        updated_at: "2024-01-14T14:30:00Z",
      },
      {
        id: "3",
        title: "Inception",
        type: "Movie",
        status: "pending",
        views: 0,
        created_at: "2024-01-16T09:15:00Z",
        updated_at: "2024-01-16T09:15:00Z",
      },
    ];
    setContent(mockContent);
  };

  const fetchTransactions = async () => {
    // Mock transaction data - replace with actual payments table query
    const mockTransactions: Transaction[] = [
      {
        id: "1",
        user_id: "user1",
        amount: 9.99,
        status: "completed",
        created_at: "2024-01-16T12:00:00Z",
        profiles: {
          username: "johndoe",
          full_name: "John Doe",
        },
      },
      {
        id: "2",
        user_id: "user2",
        amount: 19.99,
        status: "pending",
        created_at: "2024-01-16T11:30:00Z",
        profiles: {
          username: "janedoe",
          full_name: "Jane Doe",
        },
      },
    ];
    setTransactions(mockTransactions);
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
      pending: "secondary",
      disabled: "destructive",
      completed: "default",
      failed: "destructive",
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
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
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
            <CardTitle className="text-sm font-medium text-gray-300">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
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

        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Active Users
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.activeUsers.toLocaleString()}
            </div>
            <p className="text-xs text-gray-400">
              {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of
              total
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-green-400">
              +{formatCurrency(stats.monthlyRevenue)} this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Content Library
            </CardTitle>
            <Film className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalContent.toLocaleString()}
            </div>
            <p className="text-xs text-gray-400">
              {Math.floor(stats.watchTime / 60).toLocaleString()}h total watch
              time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-gray-900 border-gray-800">
          <TabsTrigger
            value="overview"
            className="text-gray-300 data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="text-gray-300 data-[state=active]:text-white"
          >
            Users
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="text-gray-300 data-[state=active]:text-white"
          >
            Content
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="text-gray-300 data-[state=active]:text-white"
          >
            Payments
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
                    <span className="text-sm text-white">
                      {stats.newUsersToday}
                    </span>
                  </div>
                  <Progress value={75} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Active Users</span>
                    <span className="text-sm text-white">
                      {stats.activeUsers}
                    </span>
                  </div>
                  <Progress value={60} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Conversion Rate
                    </span>
                    <span className="text-sm text-white">
                      {stats.conversionRate}%
                    </span>
                  </div>
                  <Progress value={stats.conversionRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white">Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-white">
                    {formatCurrency(stats.monthlyRevenue)}
                  </div>
                  <p className="text-sm text-gray-400">This month</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subscriptions</span>
                      <span className="text-white">
                        {formatCurrency(stats.monthlyRevenue * 0.8)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Rentals</span>
                      <span className="text-white">
                        {formatCurrency(stats.monthlyRevenue * 0.15)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Purchases</span>
                      <span className="text-white">
                        {formatCurrency(stats.monthlyRevenue * 0.05)}
                      </span>
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
                              {user.profiles?.username?.[0] ||
                                user.email?.[0] ||
                                "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-white">
                              {user.profiles?.full_name ||
                                user.profiles?.username ||
                                "Anonymous"}
                            </div>
                            <div className="text-sm text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {user.last_sign_in_at
                          ? formatDate(user.last_sign_in_at)
                          : "Never"}
                      </TableCell>
                      <TableCell>{getStatusBadge("active")}</TableCell>
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
                      <TableCell className="font-medium text-white">
                        {item.title}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {item.type}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {item.views.toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-gray-300">
                        {formatDate(item.created_at)}
                      </TableCell>
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
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} className="border-gray-800">
                      <TableCell className="text-white">
                        {transaction.profiles?.full_name ||
                          transaction.profiles?.username ||
                          "Unknown"}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {formatDate(transaction.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
