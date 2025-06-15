import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CommunityPost } from './useCommunityPosts';

export const useCommunityActions = (
  posts: CommunityPost[],
  setPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>
) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const toggleLike = useCallback(async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_liked) {
        // Unlike
        const { error } = await supabase
          .from('community_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('community_post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;
      }

      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_liked: !post.is_liked,
              likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
            }
          : post
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  }, [user, posts, setPosts, toast]);

  const toggleBookmark = useCallback(async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark posts",
        variant: "destructive",
      });
      return;
    }

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_bookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('community_post_bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('community_post_bookmarks')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;
      }

      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, is_bookmarked: !post.is_bookmarked }
          : post
      ));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    }
  }, [user, posts, setPosts, toast]);

  const deletePost = useCallback(
    async (postId: string) => {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Sign in to delete posts.",
          variant: "destructive",
        });
        return;
      }

      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      // Only allow owner to delete
      if (post.user_id !== user.id) {
        toast({
          title: "Permission denied",
          description: "You can only delete your own posts.",
          variant: "destructive",
        });
        return;
      }

      try {
        const { error } = await supabase
          .from('community_posts')
          .delete()
          .eq('id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        setPosts((prev) => prev.filter((p) => p.id !== postId));

        toast({
          title: "Deleted",
          description: "Your post has been deleted.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete post",
          variant: "destructive",
        });
      }
    },
    [user, posts, setPosts, toast]
  );

  return {
    toggleLike,
    toggleBookmark,
    deletePost
  };
};
