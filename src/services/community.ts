import { supabase } from "@/integrations/supabase/client";
import { safeLogError } from "@/utils/safeErrorFormat";

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  media_urls?: string[];
  media_type?: "image" | "video" | "mixed";
  movie_id?: string;
  movie_title?: string;
  movie_poster?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  profiles?: {
    id: string;
    username: string;
    full_name: string;
    avatar: string;
  };
}

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  media_urls?: string[];
  movie_id?: string;
  movie_title?: string;
  movie_poster?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  user?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}
export interface PostBookmark {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface CreatePostData {
  user_id: string;
  content: string;
  media_urls?: string[];
  movie_id?: string;
  movie_title?: string;
  movie_poster?: string;
  rating?: number;
}
// Get all community posts with enhanced error handling
export const getCommunityPosts = async (
  limit: number = 20,
  offset: number = 0,
): Promise<{
  posts: CommunityPost[];
  error: string | null;
}> => {
  try {
    console.log("🔄 Fetching community posts...");

    // First fetch the posts
    const { data: posts, error: postsError } = await supabase
      .from("community_posts")
      .select(
        `
        id,
        user_id,
        content,
        media_urls,
        movie_id,
        movie_title,
        movie_poster,
        rating,
        created_at,
        updated_at,
        likes_count,
        comments_count
      `,
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) {
      safeLogError("❌ Error fetching posts", postsError);
      throw postsError;
    }

    if (!posts) {
      console.log("📭 No posts found");
      return { posts: [], error: null };
    }

    console.log(`✅ Found ${posts.length} posts`);

    // Get unique user IDs
    const userIds = [...new Set(posts.map((post) => post.user_id))];

    if (userIds.length === 0) {
      return { posts: [], error: null };
    }

    // Fetch user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar")
      .in("id", userIds);

    if (profilesError) {
      safeLogError("⚠️ Error fetching profiles", profilesError);
      // Continue without profiles instead of failing
    }

    // Create profiles map for efficient lookup
    const profilesMap = new Map();
    profiles?.forEach((profile) => {
      profilesMap.set(profile.id, profile);
    });

    // Attach profile data to posts
    const postsWithProfiles = posts.map((post) => ({
      ...post,
      profiles: profilesMap.get(post.user_id) || {
        id: post.user_id,
        username: "Unknown User",
        full_name: "Unknown User",
        avatar: "",
      },
    }));

    console.log("✅ Posts with profiles prepared");
    return { posts: postsWithProfiles, error: null };
  } catch (error) {
    safeLogError("Error fetching posts", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch posts";
    return { posts: [], error: errorMessage };
  }
};

// Create a new community post
export const createCommunityPost = async (
  postData: CreatePostData,
): Promise<{
  post: CommunityPost | null;
  error: string | null;
}> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { post: null, error: "User not authenticated" };
    }

    const { data: post, error } = await supabase
      .from("community_posts")
      .insert({
        ...postData,
        user_id: user.id,
        likes_count: 0,
        comments_count: 0,
      })
      .select()
      .single();

    if (error) {
      safeLogError("Error creating post", error);
      throw error;
    }

    return { post, error: null };
  } catch (error) {
    safeLogError("Error creating post", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create post";
    return { post: null, error: errorMessage };
  }
};

// Delete a community post
export const deleteCommunityPost = async (postId: string): Promise<void> => {
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

// Toggle like on a post
export const togglePostLike = async (
  postId: string,
): Promise<{
  isLiked: boolean;
  likesCount: number;
}> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single();

    if (existingLike) {
      // Unlike
      await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
    } else {
      // Like
      await supabase.from("post_likes").insert({
        post_id: postId,
        user_id: user.id,
      });
    }

    // Get updated count
    const { count } = await supabase
      .from("post_likes")
      .select("*", { count: "exact" })
      .eq("post_id", postId);

    return {
      isLiked: !existingLike,
      likesCount: count || 0,
    };
  } catch (error) {
    safeLogError("Error toggling like", error);
    throw error;
  }
};

// Toggle bookmark on a post
export const togglePostBookmark = async (
  postId: string,
): Promise<{
  isBookmarked: boolean;
}> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if already bookmarked
    const { data: existingBookmark } = await supabase
      .from("post_bookmarks")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single();

    if (existingBookmark) {
      // Remove bookmark
      await supabase
        .from("post_bookmarks")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      return { isBookmarked: false };
    } else {
      // Add bookmark
      await supabase.from("post_bookmarks").insert({
        post_id: postId,
        user_id: user.id,
      });

      return { isBookmarked: true };
    }
  } catch (error) {
    safeLogError("Error toggling bookmark", error);
    throw error;
  }
};

// Get comments for a post
export const getPostComments = async (
  postId: string,
): Promise<CommunityComment[]> => {
  try {
    const { data: comments, error } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    if (!comments || comments.length === 0) {
      return [];
    }

    // Get user profiles for comments
    const userIds = [...new Set(comments.map((comment) => comment.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar")
      .in("id", userIds);

    if (profilesError) {
      safeLogError("Error fetching comment profiles", profilesError);
      // Continue without profiles instead of failing
    }

    // Create profiles map
    const profilesMap = new Map();
    profiles?.forEach((profile) => {
      profilesMap.set(profile.id, profile);
    });

    // Attach profiles to comments
    const commentsWithProfiles = comments.map((comment) => ({
      ...comment,
      profiles: profilesMap.get(comment.user_id) || {
        id: comment.user_id,
        username: "Unknown User",
        full_name: "Unknown User",
        avatar: "",
      },
    }));

    return commentsWithProfiles;
  } catch (error) {
    safeLogError("Error fetching comments", error);
    throw error;
  }
};

// Create a comment on a post
export const createPostComment = async (
  postId: string,
  content: string,
): Promise<CommunityComment> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data: comment, error } = await supabase
      .from("post_comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
      })
      .select()
      .single();

    if (error) throw error;

    // Increment comments count on the post
    await supabase.rpc("increment_comments_count", {
      post_id: postId,
    });

    // Get user profile for the comment
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar")
      .eq("id", user.id)
      .single();

    return {
      ...comment,
      profiles: profile || {
        id: user.id,
        username: "Unknown User",
        full_name: "Unknown User",
        avatar: "",
      },
    };
  } catch (error) {
    safeLogError("Error creating comment", error);
    throw error;
  }
};

// Delete a comment
export const deletePostComment = async (commentId: string): Promise<void> => {
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

// Upload media files
export const uploadMedia = async (files: File[]): Promise<string[]> => {
  try {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `community/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("media").getPublicUrl(filePath);

      return data.publicUrl;
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    safeLogError("Error uploading media", error);
    throw error;
  }
};

// Get user's bookmarked posts
export const getUserBookmarks = async (): Promise<CommunityPost[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: bookmarks, error } = await supabase
      .from("post_bookmarks")
      .select(
        `
        created_at,
        community_posts (
          id,
          user_id,
          content,
          media_urls,
          media_type,
          movie_id,
          movie_title,
          movie_poster,
          rating,
          created_at,
          updated_at,
          likes_count,
          comments_count,
          profiles (
            id,
            username,
            full_name,
            avatar
          )
        )
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (
      bookmarks?.map((bookmark) => bookmark.community_posts).filter(Boolean) ||
      []
    );
  } catch (error) {
    safeLogError("Error fetching bookmarks", error);
    return [];
  }
};

// Search posts
export const searchPosts = async (
  query: string,
  limit: number = 20,
): Promise<CommunityPost[]> => {
  try {
    if (!query.trim()) return [];

    const { data: posts, error } = await supabase
      .from("community_posts")
      .select(
        `
        id,
        user_id,
        content,
        media_urls,
        media_type,
        movie_id,
        movie_title,
        movie_poster,
        rating,
        created_at,
        updated_at,
        likes_count,
        comments_count,
        profiles (
          id,
          username,
          full_name,
          avatar
        )
      `,
      )
      .or(`content.ilike.%${query}%,movie_title.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return posts || [];
  } catch (error) {
    safeLogError("Error searching posts", error);
    throw error;
  }
};

// Community Service object for backward compatibility
export const communityService = {
  // Fetch posts (alias for getCommunityPosts)
  fetchPosts: async (
    userId?: string,
    limit: number = 20,
    offset: number = 0,
  ) => {
    const { posts } = await getCommunityPosts(limit, offset);
    return posts;
  },

  // Create post (alias for createCommunityPost)
  createPost: async (postData: CreatePostData) => {
    const { post, error } = await createCommunityPost(postData);
    if (error) throw new Error(error);
    return post;
  },

  // Fetch comments (alias for getPostComments)
  fetchComments: async (postId: string) => {
    return await getPostComments(postId);
  },

  // Upload media (alias for uploadMedia)
  uploadMedia: async (file: File, userId: string) => {
    const urls = await uploadMedia([file]);
    return urls[0];
  },

  // Toggle like (alias for togglePostLike)
  toggleLike: async (postId: string, userId: string) => {
    const { isLiked } = await togglePostLike(postId);
    return isLiked;
  },

  // Toggle bookmark (alias for togglePostBookmark)
  toggleBookmark: async (postId: string, userId: string) => {
    const { isBookmarked } = await togglePostBookmark(postId);
    return isBookmarked;
  },

  // Create comment (alias for createPostComment)
  createComment: async (postId: string, userId: string, content: string) => {
    return await createPostComment(postId, content);
  },

  // Delete post (alias for deleteCommunityPost)
  deletePost: async (postId: string, userId: string) => {
    return await deleteCommunityPost(postId);
  },

  // Delete comment (alias for deletePostComment)
  deleteComment: async (commentId: string, userId: string) => {
    return await deletePostComment(commentId);
  },

  // Search posts
  searchPosts: async (query: string, limit: number = 20) => {
    return await searchPosts(query, limit);
  },
};
