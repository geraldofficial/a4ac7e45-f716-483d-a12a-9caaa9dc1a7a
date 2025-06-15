
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockPosts: Post[] = [
      {
        id: '1',
        user: {
          id: '1',
          name: 'Sarah Connor',
          username: '@sarahc',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
        },
        content: 'Just watched the latest episode of The Last of Us! What an incredible show. The cinematography is absolutely stunning 🔥',
        media: [
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&h=400&fit=crop'
          }
        ],
        likes: 42,
        comments: 8,
        shares: 3,
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        user: {
          id: '2',
          name: 'John Wick',
          username: '@johnw',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
        },
        content: 'Movie night recommendations? Looking for something thrilling! 🎬',
        likes: 15,
        comments: 12,
        shares: 1,
        isLiked: true,
        isBookmarked: true,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      }
    ];

    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

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

  const filteredPosts = posts.filter(post => 
    searchQuery === '' || 
    post.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-3 bg-muted rounded w-1/6" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
              <div className="h-48 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredPosts.map(post => (
        <Card key={post.id} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                <img src={post.user.avatar} alt={post.user.name} className="w-full h-full object-cover" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{post.user.name}</h3>
              <p className="text-xs text-muted-foreground">{post.user.username} • {formatDistanceToNow(post.createdAt, { addSuffix: true })}</p>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">{post.content}</p>
            
            {post.media && post.media.length > 0 && (
              <div className="grid gap-2 rounded-lg overflow-hidden">
                {post.media.map((item, index) => (
                  <div key={index} className="relative aspect-video bg-muted">
                    {item.type === 'image' ? (
                      <img 
                        src={item.url} 
                        alt="Post media"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-black flex items-center justify-center">
                        <Button variant="ghost" size="lg" className="text-white">
                          <Play className="h-8 w-8" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleLike(post.id)}
                  className={`gap-2 ${post.isLiked ? 'text-red-500' : ''}`}
                >
                  <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                  {post.likes}
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  {post.comments}
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  {post.shares}
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleBookmark(post.id)}
                className={post.isBookmarked ? 'text-blue-500' : ''}
              >
                <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
