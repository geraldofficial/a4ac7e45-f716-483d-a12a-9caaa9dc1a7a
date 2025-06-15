
import React, { useState } from 'react';
import { PostCard } from './PostCard';
import { CreatePostCard } from './CreatePostCard';
import { useCommunity } from '@/hooks/useCommunity';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface CommunityFeedProps {
  searchQuery: string;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ searchQuery }) => {
  const { posts, loading, toggleLike, toggleBookmark, refreshPosts } = useCommunity();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshPosts();
    setRefreshing(false);
  };

  const handleCommentAdded = () => {
    refreshPosts();
  };

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      post.content.toLowerCase().includes(searchLower) ||
      post.user_profile?.username?.toLowerCase().includes(searchLower) ||
      post.user_profile?.full_name?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="space-y-6">
        {user && <CreatePostCard />}
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="bg-card rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
              <div className="h-64 bg-muted rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {user && <CreatePostCard />}
      
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Latest Posts</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            {searchQuery ? 'No posts found matching your search.' : 'No posts yet. Be the first to share something!'}
          </div>
          {!user && (
            <p className="text-sm text-muted-foreground">
              Sign in to create and interact with posts.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => toggleLike(post.id)}
              onBookmark={() => toggleBookmark(post.id)}
              onCommentAdded={handleCommentAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
};
