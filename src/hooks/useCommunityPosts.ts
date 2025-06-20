import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatError } from "@/lib/utils";

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  media_urls: string[] | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  user_profile?: {
    username: string;
    avatar: string;
    full_name: string;
  };
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

export const useCommunityPosts = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPosts = useCallback(async () => {
    try {
      setError(null);
      console.log("🔄 Fetching community posts...");

      // First, fetch posts without profile data
      const { data: postsData, error: postsError } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (postsError) {
        console.error("❌ Error fetching posts:", formatError(postsError));
        throw postsError;
      }

      console.log("✅ Posts fetched successfully:", postsData?.length || 0);

      if (!postsData) {
        setPosts([]);
        return;
      }

      // Get unique user IDs from posts
      const userIds = [...new Set(postsData.map((post) => post.user_id))];
      console.log("👥 Fetching profiles for users:", userIds.length);

      // Fetch profile data for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, avatar, full_name")
        .in("id", userIds);

      if (profilesError) {
        console.error(
          "⚠️ Error fetching profiles:",
          formatError(profilesError),
        );
      }

      // Create a map of user profiles for easy lookup
      const profilesMap = new Map();
      profilesData?.forEach((profile) => {
        profilesMap.set(profile.id, {
          username: profile.username || "anonymous",
          avatar: profile.avatar || "👤",
          full_name: profile.full_name || profile.username || "Anonymous User",
        });
      });

      if (user) {
        // Fetch user likes and bookmarks
        const postIds = postsData.map((post) => post.id);

        const [likesResult, bookmarksResult] = await Promise.allSettled([
          supabase
            .from("community_post_likes")
            .select("post_id")
            .eq("user_id", user.id)
            .in("post_id", postIds),
          supabase
            .from("community_post_bookmarks")
            .select("post_id")
            .eq("user_id", user.id)
            .in("post_id", postIds),
        ]);

        const likedPosts = new Set(
          likesResult.status === "fulfilled" && likesResult.value.data
            ? likesResult.value.data.map((like) => like.post_id)
            : [],
        );

        const bookmarkedPosts = new Set(
          bookmarksResult.status === "fulfilled" && bookmarksResult.value.data
            ? bookmarksResult.value.data.map((bookmark) => bookmark.post_id)
            : [],
        );

        const enrichedPosts = postsData.map((post) => ({
          ...post,
          user_profile: profilesMap.get(post.user_id) || {
            username: "anonymous",
            avatar: "👤",
            full_name: "Anonymous User",
          },
          is_liked: likedPosts.has(post.id),
          is_bookmarked: bookmarkedPosts.has(post.id),
        }));

        setPosts(enrichedPosts);
      } else {
        const enrichedPosts = postsData.map((post) => ({
          ...post,
          user_profile: profilesMap.get(post.user_id) || {
            username: "anonymous",
            avatar: "👤",
            full_name: "Anonymous User",
          },
          is_liked: false,
          is_bookmarked: false,
        }));

        setPosts(enrichedPosts);
      }
    } catch (error) {
      console.error("💥 Critical error in fetchPosts:", formatError(error));
      const errorMessage = formatError(error);
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createPost = useCallback(
    async (content: string, mediaFiles: File[]) => {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create posts",
          variant: "destructive",
        });
        return;
      }

      try {
        let mediaUrls: string[] = [];

        // Upload media files if any
        if (mediaFiles.length > 0) {
          const uploadPromises = mediaFiles.map(async (file) => {
            const fileExt = file.name.split(".").pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { data, error } = await supabase.storage
              .from("community-media")
              .upload(fileName, file);

            if (error) throw error;

            const {
              data: { publicUrl },
            } = supabase.storage.from("community-media").getPublicUrl(fileName);

            return publicUrl;
          });

          mediaUrls = await Promise.all(uploadPromises);
        }

        const { data, error } = await supabase
          .from("community_posts")
          .insert({
            user_id: user.id,
            content,
            media_urls: mediaUrls.length > 0 ? mediaUrls : null,
          })
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Success",
          description: "Post created successfully!",
        });

        fetchPosts(); // Refresh posts
      } catch (error) {
        console.error("Error creating post:", formatError(error));
        toast({
          title: "Error",
          description: "Failed to create post",
          variant: "destructive",
        });
      }
    },
    [user, toast, fetchPosts],
  );

  return {
    posts,
    setPosts,
    loading,
    setLoading,
    error,
    setError,
    fetchPosts,
    createPost,
  };
};
