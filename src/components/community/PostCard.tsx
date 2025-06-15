
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CommunityPost } from '@/hooks/useCommunity';
import { PostComments } from './PostComments';

interface PostCardProps {
  post: CommunityPost;
  onLike: () => void;
  onBookmark: () => void;
  onCommentAdded: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onLike, 
  onBookmark,
  onCommentAdded
}) => {
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});
  const [showComments, setShowComments] = useState(false);

  const handleImageError = (index: number) => {
    setImageError(prev => ({ ...prev, [index]: true }));
  };

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

  const safeFormatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'some time ago';
    }
  };

  if (!post) {
    return null;
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.user_profile?.avatar} />
          <AvatarFallback>
            {post.user_profile?.full_name?.charAt(0) || 
             post.user_profile?.username?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">
            {post.user_profile?.full_name || post.user_profile?.username || 'Anonymous'}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            @{post.user_profile?.username || 'anonymous'} • {' '}
            {safeFormatDate(post.created_at)}
          </p>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed break-words">{post.content}</p>
        
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="grid gap-2 rounded-lg overflow-hidden">
            {post.media_urls.map((url, index) => (
              <div key={index} className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                {!imageError[index] && url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img 
                    src={url} 
                    alt={`Post media ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(index)}
                  />
                ) : url.match(/\.(mp4|webm|ogg)$/i) ? (
                  <div className="w-full h-full bg-black flex items-center justify-center relative">
                    <video 
                      src={url} 
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Media unavailable</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLike}
              className={`gap-2 h-9 px-3 ${post.is_liked ? 'text-red-500' : ''}`}
            >
              <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
              <span className="text-sm">{post.likes_count || 0}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowComments(!showComments)}
              className="gap-2 h-9 px-3"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post.comments_count || 0}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShare}
              className="gap-2 h-9 px-3"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-sm">{post.shares_count || 0}</span>
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onBookmark}
            className={`h-9 w-9 p-0 ${post.is_bookmarked ? 'text-blue-500' : ''}`}
          >
            <Bookmark className={`h-4 w-4 ${post.is_bookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {showComments && (
          <PostComments
            postId={post.id}
            commentsCount={post.comments_count || 0}
            onCommentAdded={onCommentAdded}
          />
        )}
      </CardContent>
    </Card>
  );
};
