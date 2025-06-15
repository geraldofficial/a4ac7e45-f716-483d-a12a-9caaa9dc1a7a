
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PostBookmarkButtonProps {
  postId: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
}

export const PostBookmarkButton: React.FC<PostBookmarkButtonProps> = ({
  postId,
  size = 'sm',
  variant = 'ghost'
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkBookmarkStatus();
    }
  }, [user, postId]);

  const checkBookmarkStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('community_post_bookmarks')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking bookmark status:', error);
        return;
      }

      setIsBookmarked(!!data);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to bookmark posts.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('community_post_bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        setIsBookmarked(false);
        toast({
          title: "Bookmark removed",
          description: "Post removed from your bookmarks.",
        });
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('community_post_bookmarks')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;

        setIsBookmarked(true);
        toast({
          title: "Post bookmarked",
          description: "Post added to your bookmarks.",
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={toggleBookmark}
      disabled={isLoading}
      size={size}
      variant={variant}
      className={`transition-colors ${
        isBookmarked 
          ? 'text-yellow-500 hover:text-yellow-600' 
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </Button>
  );
};
