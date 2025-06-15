import React, { useState } from 'react';
import { MinimalPostCard } from './MinimalPostCard';
import { MinimalCreatePost } from './MinimalCreatePost';
import { useCommunity } from '@/hooks/useCommunity';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MinimalCommunityFeedProps {
  searchQuery: string;
}

export const MinimalCommunityFeed: React.FC<MinimalCommunityFeedProps> = ({ searchQuery }) => {
  const { posts, loading, error, toggleLike, toggleBookmark, deletePost, refreshPosts } = useCommunity();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshPosts();
    } catch (error) {
      console.error('Failed to refresh posts:', error);
    } finally {
      setRefreshing(false);
    }
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

  if (error) {
    return (
      <div className="space-y-4">
        {user && <MinimalCreatePost />}
        <Alert variant="destructive" className="mx-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. Please try refreshing.
          </AlertDescription>
        </Alert>
        <div className="text-center p-4">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-0">
        {user && <MinimalCreatePost />}
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse border-b border-border/50 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
            </div>
            <div className="space-y-2 mb-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {user && <MinimalCreatePost />}
      
      {/* Refresh Button */}
      <div className="flex justify-center p-4 border-b border-border/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Feed
        </Button>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="text-muted-foreground mb-4">
            {searchQuery ? 'No posts found matching your search.' : 'No posts yet. Be the first to share!'}
          </div>
          {!user && (
            <p className="text-sm text-muted-foreground">
              Sign in to create and interact with posts.
            </p>
          )}
        </div>
      ) : (
        <div>
          {filteredPosts.map(post => (
            <MinimalPostCard
              key={post.id}
              post={post}
              onLike={() => toggleLike(post.id)}
              onBookmark={() => toggleBookmark(post.id)}
              onCommentAdded={() => refreshPosts()}
              onDelete={user?.id === post.user_id ? () => deletePost(post.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};
