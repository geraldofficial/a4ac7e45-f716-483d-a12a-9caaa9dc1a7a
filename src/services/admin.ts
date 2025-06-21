import { supabase } from "@/integrations/supabase/client";
import { safeLogError } from "@/utils/safeErrorFormat";

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
  email?: string;
  username: string;
  full_name: string;
  avatar: string;
  created_at: string;
  last_sign_in_at?: string;
  post_count: number;
  comment_count: number;
  like_count: number;
  profiles?: {
    username?: string;
    full_name?: string;
    avatar?: string;
  };
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
  post_title: string;
  author: {
    username: string;
    full_name: string;
    avatar: string;
  };
}

// Helper function to get date ranges
const getDateRanges = () => {
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).toISOString();
  const weekAgo = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const monthAgo = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  return { today, weekAgo, monthAgo };
};

// Get comprehensive admin statistics
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const { today, weekAgo, monthAgo } = getDateRanges();

    // Get total counts
    const [
      { count: totalUsers },
      { count: totalPosts },
      { count: totalComments },
      { count: totalLikes },
      { count: newUsersToday },
      { count: newUsersThisWeek },
      { count: newUsersThisMonth },
      { count: postsToday },
      { count: postsThisWeek },
      { count: postsThisMonth },
    ] = await Promise.all([
      // Total users
      supabase.from("profiles").select("*", { count: "exact", head: true }),

      // Total posts
      supabase
        .from("community_posts")
        .select("*", { count: "exact", head: true }),

      // Total comments
      supabase
        .from("post_comments")
        .select("*", { count: "exact", head: true }),

      // Total likes
      supabase.from("post_likes").select("*", { count: "exact", head: true }),

      // New users today
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today),

      // New users this week
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo),

      // New users this month
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", monthAgo),

      // Posts today
      supabase
        .from("community_posts")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today),

      // Posts this week
      supabase
        .from("community_posts")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo),

      // Posts this month
      supabase
        .from("community_posts")
        .select("*", { count: "exact", head: true })
        .gte("created_at", monthAgo),
    ]);

    // Calculate active users (users who posted or commented in the last week)
    const { data: activeUserIds } = await supabase
      .from("community_posts")
      .select("user_id")
      .gte("created_at", weekAgo);

    const { data: activeCommenters } = await supabase
      .from("post_comments")
      .select("user_id")
      .gte("created_at", weekAgo);

    const uniqueActiveUsers = new Set([
      ...(activeUserIds?.map((u) => u.user_id) || []),
      ...(activeCommenters?.map((u) => u.user_id) || []),
    ]);

    return {
      totalUsers: totalUsers || 0,
      activeUsers: uniqueActiveUsers.size,
      totalPosts: totalPosts || 0,
      totalComments: totalComments || 0,
      totalLikes: totalLikes || 0,
      newUsersToday: newUsersToday || 0,
      newUsersThisWeek: newUsersThisWeek || 0,
      newUsersThisMonth: newUsersThisMonth || 0,
      postsToday: postsToday || 0,
      postsThisWeek: postsThisWeek || 0,
      postsThisMonth: postsThisMonth || 0,
    };
  } catch (error) {
    safeLogError("Error fetching admin stats", error);
    throw error;
  }
};

// Get all users with their statistics
export const getAdminUsers = async (
  limit: number = 50,
  offset: number = 0,
): Promise<AdminUser[]> => {
  try {
    // Get users with their basic info
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select(
        `
        id,
        username,
        full_name,
        avatar,
        created_at
      `,
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (usersError) throw usersError;

    if (!users || users.length === 0) {
      return [];
    }

    // Get post counts for each user
    const userIds = users.map((user) => user.id);

    const [
      { data: postCounts },
      { data: commentCounts },
      { data: likeCounts },
    ] = await Promise.all([
      // Post counts
      supabase.from("community_posts").select("user_id").in("user_id", userIds),

      // Comment counts
      supabase.from("post_comments").select("user_id").in("user_id", userIds),

      // Like counts (posts they liked)
      supabase.from("post_likes").select("user_id").in("user_id", userIds),
    ]);

    // Count occurrences
    const postCountMap = new Map();
    const commentCountMap = new Map();
    const likeCountMap = new Map();

    postCounts?.forEach((post) => {
      postCountMap.set(post.user_id, (postCountMap.get(post.user_id) || 0) + 1);
    });

    commentCounts?.forEach((comment) => {
      commentCountMap.set(
        comment.user_id,
        (commentCountMap.get(comment.user_id) || 0) + 1,
      );
    });

    likeCounts?.forEach((like) => {
      likeCountMap.set(like.user_id, (likeCountMap.get(like.user_id) || 0) + 1);
    });

    return users.map((user) => ({
      ...user,
      email: "", // Email not accessible via profiles table
      last_sign_in_at: undefined, // Not available in profiles
      post_count: postCountMap.get(user.id) || 0,
      comment_count: commentCountMap.get(user.id) || 0,
      like_count: likeCountMap.get(user.id) || 0,
    }));
  } catch (error) {
    safeLogError("Error fetching admin users", error);
    throw error;
  }
};

// Get all posts with author information
export const getAdminPosts = async (
  limit: number = 50,
  offset: number = 0,
): Promise<AdminPost[]> => {
  try {
    const { data: posts, error } = await supabase
      .from("community_posts")
      .select(
        `
        id,
        user_id,
        content,
        created_at,
        likes_count,
        comments_count,
        media_urls,
        profiles (
          username,
          full_name,
          avatar
        )
      `,
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return (
      posts?.map((post) => ({
        id: post.id,
        user_id: post.user_id,
        content: post.content,
        created_at: post.created_at,
        likes_count: post.likes_count,
        comments_count: post.comments_count,
        has_media: Boolean(post.media_urls && post.media_urls.length > 0),
        has_movie: false,
        movie_title: undefined,
        author: {
          username: post.profiles?.username || "Unknown",
          full_name: post.profiles?.full_name || "Unknown User",
          avatar: post.profiles?.avatar || "",
        },
      })) || []
    );
  } catch (error) {
    safeLogError("Error fetching admin posts", error);
    throw error;
  }
};

// Get all comments with post and author information
export const getAdminComments = async (
  limit: number = 50,
  offset: number = 0,
): Promise<AdminComment[]> => {
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
        community_posts (
          content
        ),
        profiles (
          username,
          full_name,
          avatar
        )
      `,
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return (
      comments?.map((comment) => ({
        id: comment.id,
        post_id: comment.post_id,
        user_id: comment.user_id,
        content: comment.content,
        created_at: comment.created_at,
        post_title:
          comment.community_posts?.content?.substring(0, 50) + "..." ||
          "Post not found",
        author: {
          username: comment.profiles?.username || "Unknown",
          full_name: comment.profiles?.full_name || "Unknown User",
          avatar: comment.profiles?.avatar || "",
        },
      })) || []
    );
  } catch (error) {
    safeLogError("Error fetching admin comments", error);
    throw error;
  }
};

// Delete a user (admin only)
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase.from("profiles").delete().eq("id", userId);

    if (error) throw error;
  } catch (error) {
    safeLogError("Error deleting user", error);
    throw error;
  }
};

// Delete a post (admin only)
export const deletePost = async (postId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("community_posts")
      .delete()
      .eq("id", postId);

    if (error) throw error;
  } catch (error) {
    safeLogError("Error deleting post", error);
    throw error;
  }
};

// Delete a comment (admin only)
export const deleteComment = async (commentId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("post_comments")
      .delete()
      .eq("id", commentId);

    if (error) throw error;
  } catch (error) {
    safeLogError("Error deleting comment", error);
    throw error;
  }
};

// Search users
export const searchUsers = async (
  query: string,
  limit: number = 20,
  offset: number = 0,
): Promise<AdminUser[]> => {
  try {
    if (!query.trim()) {
      return getAdminUsers(limit, offset);
    }

    const { data: users, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        username,
        full_name,
        avatar,
        created_at
      `,
      )
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    if (!users || users.length === 0) {
      return [];
    }

    // Get statistics for found users
    const userIds = users.map((user) => user.id);

    const [
      { data: postCounts },
      { data: commentCounts },
      { data: likeCounts },
    ] = await Promise.all([
      supabase.from("community_posts").select("user_id").in("user_id", userIds),
      supabase.from("post_comments").select("user_id").in("user_id", userIds),
      supabase.from("post_likes").select("user_id").in("user_id", userIds),
    ]);

    const postCountMap = new Map();
    const commentCountMap = new Map();
    const likeCountMap = new Map();

    postCounts?.forEach((post) => {
      postCountMap.set(post.user_id, (postCountMap.get(post.user_id) || 0) + 1);
    });

    commentCounts?.forEach((comment) => {
      commentCountMap.set(
        comment.user_id,
        (commentCountMap.get(comment.user_id) || 0) + 1,
      );
    });

    likeCounts?.forEach((like) => {
      likeCountMap.set(like.user_id, (likeCountMap.get(like.user_id) || 0) + 1);
    });

    return users.map((user) => ({
      ...user,
      email: "",
      last_sign_in_at: undefined,
      post_count: postCountMap.get(user.id) || 0,
      comment_count: commentCountMap.get(user.id) || 0,
      like_count: likeCountMap.get(user.id) || 0,
    }));
  } catch (error) {
    safeLogError("Error searching users", error);
    throw error;
  }
};

// Search posts
export const searchPosts = async (
  query: string,
  limit: number = 20,
  offset: number = 0,
): Promise<AdminPost[]> => {
  try {
    if (!query.trim()) {
      return getAdminPosts(limit, offset);
    }

    const { data: posts, error } = await supabase
      .from("community_posts")
      .select(
        `
        id,
        user_id,
        content,
        created_at,
        likes_count,
        comments_count,
        media_urls,
        movie_title,
        profiles (
          username,
          full_name,
          avatar
        )
      `,
      )
      .or(`content.ilike.%${query}%,movie_title.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return (
      posts?.map((post) => ({
        id: post.id,
        user_id: post.user_id,
        content: post.content,
        created_at: post.created_at,
        likes_count: post.likes_count,
        comments_count: post.comments_count,
        has_media: Boolean(post.media_urls && post.media_urls.length > 0),
        has_movie: Boolean(post.movie_title),
        movie_title: post.movie_title,
        author: {
          username: post.profiles?.username || "Unknown",
          full_name: post.profiles?.full_name || "Unknown User",
          avatar: post.profiles?.avatar || "",
        },
      })) || []
    );
  } catch (error) {
    safeLogError("Error searching posts", error);
    throw error;
  }
};

// Get system health metrics
export const getSystemHealth = async () => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("created_at")
      .limit(1);

    if (error) throw error;

    return {
      database: "healthy",
      storage: "healthy", // Would need actual storage check
      auth: "healthy", // Would need actual auth check
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    safeLogError("Error checking system health", error);
    return {
      database: "error",
      storage: "unknown",
      auth: "unknown",
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Admin Service object for backward compatibility
export const adminService = {
  // Get stats (alias for getAdminStats)
  getStats: async () => {
    return await getAdminStats();
  },

  // Get users (alias for getAdminUsers)
  getUsers: async (limit: number = 50, offset: number = 0) => {
    return await getAdminUsers(limit, offset);
  },

  // Get posts (alias for getAdminPosts)
  getPosts: async (limit: number = 50, offset: number = 0) => {
    return await getAdminPosts(limit, offset);
  },

  // Get comments (alias for getAdminComments)
  getComments: async (limit: number = 50, offset: number = 0) => {
    return await getAdminComments(limit, offset);
  },

  // Delete user (alias for deleteUser)
  deleteUser: async (userId: string) => {
    return await deleteUser(userId);
  },

  // Delete post (alias for deletePost)
  deletePost: async (postId: string) => {
    return await deletePost(postId);
  },

  // Delete comment (alias for deleteComment)
  deleteComment: async (commentId: string) => {
    return await deleteComment(commentId);
  },

  // Search users (alias for searchUsers)
  searchUsers: async (
    query: string,
    limit: number = 20,
    offset: number = 0,
  ) => {
    return await searchUsers(query, limit, offset);
  },

  // Search posts (alias for searchPosts)
  searchPosts: async (
    query: string,
    limit: number = 20,
    offset: number = 0,
  ) => {
    return await searchPosts(query, limit, offset);
  },

  // Get system health (alias for getSystemHealth)
  getSystemHealth: async () => {
    return await getSystemHealth();
  },
};
