import { supabase } from "@/integrations/supabase/client";
import { formatError } from "@/lib/utils";

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

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    id: string;
    username: string;
    full_name: string;
    avatar: string;
  };
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PostBookmark {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

class CommunityService {
  // Posts
  async fetchPosts(
    userId?: string,
    limit = 20,
    offset = 0,
  ): Promise<CommunityPost[]> {
    try {
      let query = supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: posts, error } = await query;
      if (error) throw error;

      // Get likes and comments counts
      const postsWithCounts = await Promise.all(
        (posts || []).map(async (post) => {
          const [likesResult, commentsResult, profileResult] =
            await Promise.all([
              supabase
                .from("community_post_likes")
                .select("id, user_id")
                .eq("post_id", post.id),
              supabase
                .from("community_post_comments")
                .select("id")
                .eq("post_id", post.id),
              supabase
                .from("profiles")
                .select("id, username, full_name, avatar")
                .eq("id", post.user_id)
                .single(),
            ]);

          return {
            ...post,
            likes_count: likesResult.data?.length || 0,
            comments_count: commentsResult.data?.length || 0,
            is_liked: userId
              ? likesResult.data?.some((like: any) => like.user_id === userId)
              : false,
            is_bookmarked: false, // Will implement later
            profiles: profileResult.data
              ? {
                  id: profileResult.data.id,
                  username: profileResult.data.username,
                  full_name: profileResult.data.full_name,
                  avatar: profileResult.data.avatar,
                }
              : undefined,
          };
        }),
      );

      return postsWithCounts;
    } catch (error) {
      console.error("Error fetching posts:", formatError(error));
      throw error;
    }
  }

  async createPost(data: {
    user_id: string;
    content: string;
    media_urls?: string[];
    media_type?: "image" | "video" | "mixed";
    movie_id?: string;
    movie_title?: string;
    movie_poster?: string;
    rating?: number;
  }): Promise<CommunityPost> {
    try {
      const { data: post, error } = await supabase
        .from("community_posts")
        .insert({
          user_id: data.user_id,
          content: data.content,
          media_urls: data.media_urls,
          media_type: data.media_type,
          movie_id: data.movie_id,
          movie_title: data.movie_title,
          movie_poster: data.movie_poster,
          rating: data.rating,
        })
        .select("*")
        .single();

      if (error) throw error;

      // Get profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar")
        .eq("id", data.user_id)
        .single();

      return {
        ...post,
        likes_count: 0,
        comments_count: 0,
        is_liked: false,
        is_bookmarked: false,
        profiles: profile
          ? {
              id: profile.id,
              username: profile.username,
              full_name: profile.full_name,
              avatar: profile.avatar,
            }
          : undefined,
      };
    } catch (error) {
      console.error("Error creating post:", formatError(error));
      throw error;
    }
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", userId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting post:", formatError(error));
      throw error;
    }
  }

  // Likes
  async toggleLike(postId: string, userId: string): Promise<boolean> {
    try {
      // Check if already liked
      const { data: existingLike, error: checkError } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .single();

      if (checkError && checkError.code !== "PGRST116") throw checkError;

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);

        if (error) throw error;
        return false;
      } else {
        // Like
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: userId });

        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.error("Error toggling like:", formatError(error));
      throw error;
    }
  }

  // Bookmarks
  async toggleBookmark(postId: string, userId: string): Promise<boolean> {
    try {
      // Check if already bookmarked
      const { data: existingBookmark, error: checkError } = await supabase
        .from("post_bookmarks")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .single();

      if (checkError && checkError.code !== "PGRST116") throw checkError;

      if (existingBookmark) {
        // Remove bookmark
        const { error } = await supabase
          .from("post_bookmarks")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);

        if (error) throw error;
        return false;
      } else {
        // Add bookmark
        const { error } = await supabase
          .from("post_bookmarks")
          .insert({ post_id: postId, user_id: userId });

        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.error("Error toggling bookmark:", formatError(error));
      throw error;
    }
  }

  // Comments
  async fetchComments(postId: string): Promise<CommunityComment[]> {
    try {
      const { data: comments, error } = await supabase
        .from("post_comments")
        .select(
          `
          *,
          profiles!post_comments_user_id_fkey (
            id,
            username,
            full_name,
            avatar
          )
        `,
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return comments || [];
    } catch (error) {
      console.error("Error fetching comments:", formatError(error));
      throw error;
    }
  }

  async createComment(
    postId: string,
    userId: string,
    content: string,
  ): Promise<CommunityComment> {
    try {
      const { data: comment, error } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          user_id: userId,
          content: content.trim(),
        })
        .select(
          `
          *,
          profiles!post_comments_user_id_fkey (
            id,
            username,
            full_name,
            avatar
          )
        `,
        )
        .single();

      if (error) throw error;
      return comment;
    } catch (error) {
      console.error("Error creating comment:", formatError(error));
      throw error;
    }
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("post_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", userId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting comment:", formatError(error));
      throw error;
    }
  }

  // Media Upload
  async uploadMedia(file: File, userId: string): Promise<string> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("community-media")
        .upload(fileName, file);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("community-media").getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading media:", formatError(error));
      throw error;
    }
  }

  // Search
  async searchPosts(query: string, userId?: string): Promise<CommunityPost[]> {
    try {
      const { data: posts, error } = await supabase
        .from("community_posts")
        .select(
          `
          *,
          profiles!community_posts_user_id_fkey (
            id,
            username,
            full_name,
            avatar
          )
        `,
        )
        .or(`content.ilike.%${query}%,movie_title.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Add counts and user interactions
      const postsWithCounts = await Promise.all(
        (posts || []).map(async (post) => {
          const [likesResult, commentsResult] = await Promise.all([
            supabase.from("post_likes").select("id").eq("post_id", post.id),
            supabase.from("post_comments").select("id").eq("post_id", post.id),
          ]);

          return {
            ...post,
            likes_count: likesResult.data?.length || 0,
            comments_count: commentsResult.data?.length || 0,
            is_liked: false,
            is_bookmarked: false,
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

export const communityService = new CommunityService();
