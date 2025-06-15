
import React, { useState } from 'react';
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

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onLike, 
  onBookmark, 
  onComment, 
  onShare 
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <Avatar className="h-8 w-8 md:h-10 md:w-10">
          <AvatarFallback>
            <img src={post.user.avatar} alt={post.user.name} className="w-full h-full object-cover" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{post.user.name}</h3>
          <p className="text-xs text-muted-foreground truncate">
            {post.user.username} • {formatDistanceToNow(post.createdAt, { addSuffix: true })}
          </p>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-3 md:space-y-4">
        <p className="text-sm leading-relaxed break-words">{post.content}</p>
        
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
                      <Play className="h-6 w-6 md:h-8 md:w-8" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onLike(post.id)}
              className={`gap-1 md:gap-2 h-8 px-2 md:px-3 ${post.isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs md:text-sm">{post.likes}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onComment(post.id)}
              className="gap-1 md:gap-2 h-8 px-2 md:px-3"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs md:text-sm">{post.comments}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onShare(post.id)}
              className="gap-1 md:gap-2 h-8 px-2 md:px-3"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-xs md:text-sm">{post.shares}</span>
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onBookmark(post.id)}
            className={`h-8 w-8 p-0 ${post.isBookmarked ? 'text-blue-500' : ''}`}
          >
            <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
