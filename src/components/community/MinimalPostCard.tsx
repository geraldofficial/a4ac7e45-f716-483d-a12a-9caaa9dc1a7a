
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CommunityPost } from '@/hooks/useCommunity';
import { PostComments } from './PostComments';

interface MinimalPostCardProps {
  post: CommunityPost;
  onLike: () => void;
  onBookmark: () => void;
  onCommentAdded: () => void;
}

export const MinimalPostCard: React.FC<MinimalPostCardProps> = ({ 
  post, 
  onLike, 
  onBookmark,
  onCommentAdded
}) => {
  const [showComments, setShowComments] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${post.user_profile?.full_name || post.user_profile?.username}`,
          text: post.content,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Card className="border-0 border-b border-border/50 rounded-none bg-transparent">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.user_profile?.avatar} />
            <AvatarFallback className="text-xs">
              {post.user_profile?.full_name?.charAt(0) || 
               post.user_profile?.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">
              {post.user_profile?.full_name || post.user_profile?.username || 'Anonymous'}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-sm leading-relaxed break-words">{post.content}</p>
        </div>
      )}
      
      {/* Media */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div className="relative aspect-square bg-muted overflow-hidden">
          {post.media_urls.map((url, index) => (
            <div key={index} className="w-full h-full">
              {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img 
                  src={url} 
                  alt={`Post media ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : url.match(/\.(mp4|webm|ogg)$/i) ? (
                <video 
                  src={url} 
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Media unavailable</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between p-4 pt-3">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLike}
            className={`h-9 px-0 gap-2 ${post.is_liked ? 'text-red-500' : ''}`}
          >
            <Heart className={`h-5 w-5 ${post.is_liked ? 'fill-current' : ''}`} />
            <span className="text-sm">{post.likes_count || 0}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowComments(!showComments)}
            className="h-9 px-0 gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">{post.comments_count || 0}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShare}
            className="h-9 px-0"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onBookmark}
          className={`h-9 w-9 p-0 ${post.is_bookmarked ? 'text-blue-500' : ''}`}
        >
          <Bookmark className={`h-5 w-5 ${post.is_bookmarked ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-4 pb-4">
          <PostComments
            postId={post.id}
            commentsCount={post.comments_count || 0}
            onCommentAdded={onCommentAdded}
          />
        </div>
      )}
    </Card>
  );
};
