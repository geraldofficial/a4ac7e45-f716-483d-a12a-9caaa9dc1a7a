
import React, { useState, useEffect } from 'react';
import { PostCard } from './PostCard';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: Date;
}

interface CommunityFeedProps {
  searchQuery: string;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ searchQuery }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading posts - replace with real API call
    const loadPosts = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate dynamic posts instead of hardcoded data
        const dynamicPosts: Post[] = Array.from({ length: 5 }, (_, index) => ({
          id: `post-${index + 1}`,
          user: {
            id: `user-${index + 1}`,
            name: `User ${index + 1}`,
            username: `@user${index + 1}`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${index + 1}`
          },
          content: `This is a sample post ${index + 1}. Share your thoughts about movies and TV shows!`,
          media: index % 3 === 0 ? [{
            type: 'image' as const,
            url: `https://images.unsplash.com/photo-${1440404653325 + index}?w=600&h=400&fit=crop`
          }] : undefined,
          likes: Math.floor(Math.random() * 100),
          comments: Math.floor(Math.random() * 20),
          shares: Math.floor(Math.random() * 10),
          isLiked: Math.random() > 0.5,
          isBookmarked: Math.random() > 0.7,
          createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
        }));

        setPosts(dynamicPosts);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load posts. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [toast]);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const handleComment = (postId: string) => {
    toast({
      title: "Coming Soon",
      description: "Comment functionality will be added soon!",
    });
  };

  const handleShare = (postId: string) => {
    toast({
      title: "Shared!",
      description: "Post shared successfully.",
    });
  };

  const filteredPosts = posts.filter(post => 
    searchQuery === '' || 
    post.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-card rounded-lg">
            <div className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 md:h-4 bg-muted rounded w-1/4" />
                  <div className="h-2 md:h-3 bg-muted rounded w-1/6" />
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 md:h-4 bg-muted rounded w-3/4" />
                <div className="h-3 md:h-4 bg-muted rounded w-1/2" />
              </div>
              <div className="h-32 md:h-48 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {filteredPosts.length === 0 ? (
        <div className="text-center py-8 md:py-12">
          <p className="text-muted-foreground">No posts found.</p>
        </div>
      ) : (
        filteredPosts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onBookmark={handleBookmark}
            onComment={handleComment}
            onShare={handleShare}
          />
        ))
      )}
    </div>
  );
};
