
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_profile?: {
    username: string;
    avatar: string;
    full_name: string;
  };
}

interface PostCommentsProps {
  postId: string;
  commentsCount: number;
  onCommentAdded: () => void;
}

export const PostComments: React.FC<PostCommentsProps> = ({ 
  postId, 
  commentsCount,
  onCommentAdded 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchComments = async () => {
    if (!showComments) return;
    
    setLoading(true);
    try {
      const { data: commentsData, error } = await supabase
        .from('community_post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!commentsData) {
        setComments([]);
        return;
      }

      // Get user profiles for comments
      const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
      
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, avatar, full_name')
        .in('id', userIds);

      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, {
          username: profile.username || 'anonymous',
          avatar: profile.avatar || '👤',
          full_name: profile.full_name || profile.username || 'Anonymous User'
        });
      });

      const enrichedComments = commentsData.map(comment => ({
        ...comment,
        user_profile: profilesMap.get(comment.user_id) || {
          username: 'anonymous',
          avatar: '👤',
          full_name: 'Anonymous User'
        }
      }));

      setComments(enrichedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('community_post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      onCommentAdded();
      fetchComments();
      
      toast({
        title: "Success",
        description: "Comment added successfully!",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('community_post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      fetchComments();
      onCommentAdded();
      
      toast({
        title: "Success",
        description: "Comment deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchComments();
  }, [showComments, postId]);

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowComments(!showComments)}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <MessageCircle className="h-4 w-4" />
        {commentsCount} Comments
      </Button>

      {showComments && (
        <Card>
          <CardHeader className="pb-4">
            <h4 className="font-semibold">Comments ({commentsCount})</h4>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={user.avatar || user.image} />
                  <AvatarFallback>
                    {user.full_name?.charAt(0) || user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-20 resize-none"
                  />
                  <Button
                    onClick={handleSubmitComment}
                    disabled={submitting || !newComment.trim()}
                    size="sm"
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? 'Posting...' : 'Comment'}
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-24"></div>
                      <div className="h-16 bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                {user ? 'Be the first to comment!' : 'No comments yet. Sign in to add one.'}
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={comment.user_profile?.avatar} />
                      <AvatarFallback>
                        {comment.user_profile?.full_name?.charAt(0) || 
                         comment.user_profile?.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {comment.user_profile?.full_name || comment.user_profile?.username || 'Anonymous'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {user && user.id === comment.user_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm break-words">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
