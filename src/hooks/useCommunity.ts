
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

export const useCommunity = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Use refs to track subscriptions and prevent multiple subscriptions
  const subscriptionsRef = useRef<{
    posts?: any;
    likes?: any;
    comments?: any;
  }>({});
  const mountedRef = useRef(true);

  const fetchPosts = async () => {
    try {
      setError(null);
      console.log('🔄 Fetching community posts...');
      
      // First, fetch posts without profile data
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('❌ Error fetching posts:', postsError);
        throw postsError;
      }

      console.log('✅ Posts fetched successfully:', postsData?.length || 0);

      if (!postsData) {
        setPosts([]);
        return;
      }

      // Get unique user IDs from posts
      const userIds = [...new Set(postsData.map(post => post.user_id))];
      console.log('👥 Fetching profiles for users:', userIds.length);

      // Fetch profile data for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar, full_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('⚠️ Error fetching profiles:', profilesError);
      }

      // Create a map of user profiles for easy lookup
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, {
          username: profile.username || 'anonymous',
          avatar: profile.avatar || '👤',
          full_name: profile.full_name || profile.username || 'Anonymous User'
        });
      });

      if (user) {
        // Fetch user likes and bookmarks
        const postIds = postsData.map(post => post.id);
        
        const [likesResult, bookmarksResult] = await Promise.allSettled([
          supabase
            .from('community_post_likes')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', postIds),
          supabase
            .from('community_post_bookmarks')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', postIds)
        ]);

        const likedPosts = new Set(
          likesResult.status === 'fulfilled' && likesResult.value.data
            ? likesResult.value.data.map(like => like.post_id)
            : []
        );
        
        const bookmarkedPosts = new Set(
          bookmarksResult.status === 'fulfilled' && bookmarksResult.value.data
            ? bookmarksResult.value.data.map(bookmark => bookmark.post_id)
            : []
        );

        const enrichedPosts = postsData.map(post => ({
          ...post,
          user_profile: profilesMap.get(post.user_id) || {
            username: 'anonymous',
            avatar: '👤',
            full_name: 'Anonymous User'
          },
          is_liked: likedPosts.has(post.id),
          is_bookmarked: bookmarkedPosts.has(post.id)
        }));

        if (mountedRef.current) {
          setPosts(enrichedPosts);
        }
      } else {
        const enrichedPosts = postsData.map(post => ({
          ...post,
          user_profile: profilesMap.get(post.user_id) || {
            username: 'anonymous',
            avatar: '👤',
            full_name: 'Anonymous User'
          },
          is_liked: false,
          is_bookmarked: false
        }));

        if (mountedRef.current) {
          setPosts(enrichedPosts);
        }
      }
    } catch (error) {
      console.error('💥 Critical error in fetchPosts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load posts';
      if (mountedRef.current) {
        setError(errorMessage);
        toast({
          title: "Error",
          description: "Failed to load posts. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const createPost = async (content: string, mediaFiles: File[]) => {
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
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from('community-media')
            .upload(fileName, file);

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('community-media')
            .getPublicUrl(fileName);

          return publicUrl;
        });

        mediaUrls = await Promise.all(uploadPromises);
      }

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          content,
          media_urls: mediaUrls.length > 0 ? mediaUrls : null
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
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  const toggleLike = async (postId: string) => {
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
  };

  const toggleBookmark = async (postId: string) => {
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
  };

  useEffect(() => {
    mountedRef.current = true;
    console.log('🚀 Community hook initializing...');
    
    // Clean up any existing subscriptions first
    Object.values(subscriptionsRef.current).forEach(subscription => {
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }
      }
    });
    
    // Reset subscriptions
    subscriptionsRef.current = {};
    
    fetchPosts();

    // Set up real-time subscriptions with unique channel names
    const channelName = `community-updates-${Date.now()}-${Math.random()}`;
    
    try {
      const postsChannel = supabase
        .channel(`${channelName}-posts`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'community_posts'
        }, () => {
          console.log('📡 Real-time post update detected');
          if (mountedRef.current) {
            fetchPosts();
          }
        });

      const likesChannel = supabase
        .channel(`${channelName}-likes`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'community_post_likes'
        }, () => {
          console.log('📡 Real-time like update detected');
          if (mountedRef.current) {
            fetchPosts();
          }
        });

      const commentsChannel = supabase
        .channel(`${channelName}-comments`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'community_post_comments'
        }, () => {
          console.log('📡 Real-time comment update detected');
          if (mountedRef.current) {
            fetchPosts();
          }
        });

      // Subscribe to channels
      postsChannel.subscribe();
      likesChannel.subscribe();
      commentsChannel.subscribe();

      // Store subscriptions for cleanup
      subscriptionsRef.current = {
        posts: postsChannel,
        likes: likesChannel,
        comments: commentsChannel
      };

    } catch (error) {
      console.error('Error setting up real-time subscriptions:', error);
    }

    return () => {
      console.log('🧹 Cleaning up community subscriptions');
      mountedRef.current = false;
      
      // Clean up subscriptions
      Object.values(subscriptionsRef.current).forEach(subscription => {
        if (subscription) {
          try {
            subscription.unsubscribe();
          } catch (error) {
            console.error('Error unsubscribing:', error);
          }
        }
      });
      
      subscriptionsRef.current = {};
    };
  }, [user]);

  return {
    posts,
    loading,
    error,
    createPost,
    toggleLike,
    toggleBookmark,
    refreshPosts: fetchPosts
  };
};
