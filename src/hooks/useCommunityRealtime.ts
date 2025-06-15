
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useCommunityRealtime = (fetchPosts: () => Promise<void>) => {
  const { user } = useAuth();
  const subscriptionsRef = useRef<{
    posts?: any;
    likes?: any;
    comments?: any;
  }>({});
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    console.log('🚀 Community realtime initializing...');
    
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
  }, [user, fetchPosts]);
};
