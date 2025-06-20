import { supabase } from "@/integrations/supabase/client";
import { formatError } from "@/lib/utils";

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  postsToday: number;
  postsThisWeek: number;
  postsThisMonth: number;
}

export interface AdminUser {
  id: string;
  username: string;
  full_name: string;
  avatar: string;
  created_at: string;
  post_count: number;
  comment_count: number;
  like_count: number;
}

export interface AdminPost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  has_media: boolean;
  has_movie: boolean;
  movie_title?: string;
  author: {
    username: string;
    full_name: string;
    avatar: string;
  };
}

export interface AdminComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author: {
    username: string;
    full_name: string;
    avatar: string;
  };
  post: {
    id: string;
    content: string;
  };
}

class AdminService {
  async getStats(): Promise<AdminStats> {
    try {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Parallel queries for better performance
      const [
        usersResult,
        postsResult,
        commentsResult,
        likesResult,
        newUsersTodayResult,
        newUsersWeekResult,
        newUsersMonthResult,
        postsTodayResult,
        postsWeekResult,
        postsMonthResult,
      ] = await Promise.all([
        // Total users
        supabase.from("profiles").select("id", { count: "exact" }),

        // Total posts
        supabase.from("community_posts").select("id", { count: "exact" }),

        // Total comments
        supabase
          .from("community_post_comments")
          .select("id", { count: "exact" }),

        // Total likes
        supabase.from("community_post_likes").select("id", { count: "exact" }),

        // New users today
        supabase
          .from("profiles")
          .select("id", { count: "exact" })
          .gte("created_at", todayStart.toISOString()),

        // New users this week
        supabase
          .from("profiles")
          .select("id", { count: "exact" })
          .gte("created_at", weekStart.toISOString()),

        // New users this month
        supabase
          .from("profiles")
          .select("id", { count: "exact" })
          .gte("created_at", monthStart.toISOString()),

        // Posts today
        supabase
          .from("community_posts")
          .select("id", { count: "exact" })
          .gte("created_at", todayStart.toISOString()),

        // Posts this week
        supabase
          .from("community_posts")
          .select("id", { count: "exact" })
          .gte("created_at", weekStart.toISOString()),

        // Posts this month
        supabase
          .from("community_posts")
          .select("id", { count: "exact" })
          .gte("created_at", monthStart.toISOString()),
      ]);

      return {
        totalUsers: usersResult.count || 0,
        activeUsers: Math.floor((usersResult.count || 0) * 0.3), // Estimate active users
        totalPosts: postsResult.count || 0,
        totalComments: commentsResult.count || 0,
        totalLikes: likesResult.count || 0,
        newUsersToday: newUsersTodayResult.count || 0,
        newUsersThisWeek: newUsersWeekResult.count || 0,
        newUsersThisMonth: newUsersMonthResult.count || 0,
        postsToday: postsTodayResult.count || 0,
        postsThisWeek: postsWeekResult.count || 0,
        postsThisMonth: postsMonthResult.count || 0,
      };
    } catch (error) {
      console.error("Error fetching admin stats:", formatError(error));
      throw error;
    }
  }

  async getUsers(limit = 20, offset = 0): Promise<AdminUser[]> {
    try {
      const { data: users, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar, created_at")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Get activity counts for each user
      const usersWithStats = await Promise.all(
        (users || []).map(async (user) => {
          const [postsResult, commentsResult, likesResult] = await Promise.all([
            supabase
              .from("community_posts")
              .select("id", { count: "exact" })
              .eq("user_id", user.id),

            supabase
              .from("community_post_comments")
              .select("id", { count: "exact" })
              .eq("user_id", user.id),

            supabase
              .from("community_post_likes")
              .select("id", { count: "exact" })
              .eq("user_id", user.id),
          ]);

          return {
            ...user,
            post_count: postsResult.count || 0,
            comment_count: commentsResult.count || 0,
            like_count: likesResult.count || 0,
          };
        }),
      );

      return usersWithStats;
    } catch (error) {
      console.error("Error fetching admin users:", formatError(error));
      throw error;
    }
  }

  async getPosts(limit = 20, offset = 0): Promise<AdminPost[]> {
    try {
      const { data: posts, error } = await supabase
        .from("community_posts")
        .select(
          `
          id,
          user_id,
          content,
          created_at,
          media_urls
        `,
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Get likes and comments counts and profile data
      const postsWithCounts = await Promise.all(
        (posts || []).map(async (post) => {
          const [likesResult, commentsResult, profileResult] =
            await Promise.all([
              supabase
                .from("community_post_likes")
                .select("id", { count: "exact" })
                .eq("post_id", post.id),

              supabase
                .from("community_post_comments")
                .select("id", { count: "exact" })
                .eq("post_id", post.id),

              supabase
                .from("profiles")
                .select("username, full_name, avatar")
                .eq("id", post.user_id)
                .single(),
            ]);

          return {
            id: post.id,
            user_id: post.user_id,
            content: post.content,
            created_at: post.created_at,
            likes_count: likesResult.count || 0,
            comments_count: commentsResult.count || 0,
            has_media: !!(post.media_urls && post.media_urls.length > 0),
            has_movie: false, // Not in current schema
            movie_title: undefined,
            author: {
              username: profileResult.data?.username || "Unknown",
              full_name: profileResult.data?.full_name || "Unknown User",
              avatar: profileResult.data?.avatar || "",
            },
          };
        }),
      );

      return postsWithCounts;
    } catch (error) {
      console.error("Error fetching admin posts:", formatError(error));
      throw error;
    }
  }

  async getComments(limit = 20, offset = 0): Promise<AdminComment[]> {
    try {
      const { data: comments, error } = await supabase
        .from("post_comments")
        .select(
          `
          id,
          post_id,
          user_id,
          content,
          created_at,
          profiles!post_comments_user_id_fkey (
            username,
            full_name,
            avatar
          ),
          community_posts!post_comments_post_id_fkey (
            id,
            content
          )
        `,
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return (comments || []).map((comment) => ({
        id: comment.id,
        post_id: comment.post_id,
        user_id: comment.user_id,
        content: comment.content,
        created_at: comment.created_at,
        author: {
          username: comment.profiles?.username || "Unknown",
          full_name: comment.profiles?.full_name || "Unknown User",
          avatar: comment.profiles?.avatar || "",
        },
        post: {
          id: comment.community_posts?.id || "",
          content: comment.community_posts?.content || "",
        },
      }));
    } catch (error) {
      console.error("Error fetching admin comments:", formatError(error));
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      // Note: In a real app, you'd want to handle this server-side
      // with proper cascading deletes and data cleanup
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting user:", formatError(error));
      throw error;
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting post:", formatError(error));
      throw error;
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("post_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting comment:", formatError(error));
      throw error;
    }
  }

  async searchUsers(query: string): Promise<AdminUser[]> {
    try {
      const { data: users, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar, created_at")
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Get activity counts
      const usersWithStats = await Promise.all(
        (users || []).map(async (user) => {
          const [postsResult, commentsResult, likesResult] = await Promise.all([
            supabase
              .from("community_posts")
              .select("id", { count: "exact" })
              .eq("user_id", user.id),
            supabase
              .from("post_comments")
              .select("id", { count: "exact" })
              .eq("user_id", user.id),
            supabase
              .from("post_likes")
              .select("id", { count: "exact" })
              .eq("user_id", user.id),
          ]);

          return {
            ...user,
            post_count: postsResult.count || 0,
            comment_count: commentsResult.count || 0,
            like_count: likesResult.count || 0,
          };
        }),
      );

      return usersWithStats;
    } catch (error) {
      console.error("Error searching users:", formatError(error));
      throw error;
    }
  }

  async searchPosts(query: string): Promise<AdminPost[]> {
    try {
      const { data: posts, error } = await supabase
        .from("community_posts")
        .select(
          `
          id,
          user_id,
          content,
          created_at,
          media_urls,
          movie_title,
          profiles!community_posts_user_id_fkey (
            username,
            full_name,
            avatar
          )
        `,
        )
        .ilike("content", `%${query}%`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Get counts
      const postsWithCounts = await Promise.all(
        (posts || []).map(async (post) => {
          const [likesResult, commentsResult] = await Promise.all([
            supabase
              .from("post_likes")
              .select("id", { count: "exact" })
              .eq("post_id", post.id),
            supabase
              .from("post_comments")
              .select("id", { count: "exact" })
              .eq("post_id", post.id),
          ]);

          return {
            id: post.id,
            user_id: post.user_id,
            content: post.content,
            created_at: post.created_at,
            likes_count: likesResult.count || 0,
            comments_count: commentsResult.count || 0,
            has_media: !!(post.media_urls && post.media_urls.length > 0),
            has_movie: !!post.movie_title,
            movie_title: post.movie_title,
            author: {
              username: post.profiles?.username || "Unknown",
              full_name: post.profiles?.full_name || "Unknown User",
              avatar: post.profiles?.avatar || "",
            },
          };
        }),
      );

      return postsWithCounts;
    } catch (error) {
      console.error("Error searching posts:", formatError(error));
      throw error;
    }
  }
}

export const adminService = new AdminService();
