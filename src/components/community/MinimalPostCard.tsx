import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CommunityPost } from '@/hooks/useCommunityPosts';

interface MinimalPostCardProps {
  post: CommunityPost;
  onLike: () => void;
  onBookmark: () => void;
  onCommentAdded: () => void;
  onDelete?: () => void; // Add this prop
}

export const MinimalPostCard: React.FC<MinimalPostCardProps> = ({
  post,
  onLike,
  onBookmark,
  onCommentAdded,
  onDelete,
}) => {
  const { user } = useAuth();

  return (
    <div className="border-b border-border/50 p-4">
      <div className="flex items-center gap-2 justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold">{post.user_profile?.username || 'User'}</span>
        </div>
        {user && post.user_id === user.id && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-red-600"
            onClick={onDelete}
            aria-label="Delete post"
            title="Delete post"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
