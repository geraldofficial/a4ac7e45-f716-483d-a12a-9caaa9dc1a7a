import React, { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Film,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { useCommunityActions } from "@/hooks/useCommunityActions";
import { useAuthState } from "@/hooks/useAuthState";
import { cn, formatError } from "@/lib/utils";
import { toast } from "sonner";

interface Post {
  id: string;
  user_id: string;
  content: string;
  movie_id?: string;
  movie_title?: string;
  movie_poster?: string;
  rating?: number;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  profiles?: {
    username: string;
    full_name: string;
    avatar: string;
  };
}

interface CommunityFeedProps {
  className?: string;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ className }) => {
  const { user } = useAuthState();
  const { posts, loading, fetchPosts, createPost } = useCommunityPosts();
  const { toggleLike, toggleBookmark, addComment } = useCommunityActions();

  const [newPost, setNewPost] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [activeComments, setActiveComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreatePost = async () => {
    if (!newPost.trim() && !selectedMovie) return;

    try {
      // Note: movie data cannot be stored due to DB schema limitations
      await createPost(newPost.trim(), []);

      setNewPost("");
      setSelectedMovie(null);
      setRating(0);
      toast.success("Post created successfully!");
    } catch (error) {
      toast.error(`Failed to create post: ${formatError(error)}`);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await toggleLike(postId);
    } catch (error) {
      toast.error(`Failed to like post: ${formatError(error)}`);
    }
  };

  const handleBookmark = async (postId: string) => {
    try {
      await toggleBookmark(postId);
    } catch (error) {
      toast.error(`Failed to bookmark post: ${formatError(error)}`);
    }
  };

  const handleComment = async (postId: string) => {
    if (!newComment.trim()) return;

    try {
      await addComment(postId, newComment.trim());
      setNewComment("");
      setActiveComments(null);
      toast.success("Comment added!");
    } catch (error) {
      toast.error(`Failed to add comment: ${formatError(error)}`);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderStars = (
    rating: number,
    interactive = false,
    onRate?: (rating: number) => void,
  ) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4 transition-colors",
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-400",
              interactive && "cursor-pointer hover:text-yellow-400",
            )}
            onClick={() => interactive && onRate?.(star)}
          />
        ))}
        {rating > 0 && (
          <span className="text-sm text-gray-400 ml-1">({rating}/5)</span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-24" />
                  <div className="h-3 bg-gray-300 rounded w-16" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded" />
                <div className="h-4 bg-gray-300 rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Create Post */}
      {user && (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  {user.username?.[0] || user.email?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium text-white">Share your thoughts</h4>
                <p className="text-sm text-gray-400">What are you watching?</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="What's on your mind about movies?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white resize-none"
              rows={3}
            />

            {selectedMovie && (
              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                <img
                  src={selectedMovie.poster}
                  alt={selectedMovie.title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h5 className="font-medium text-white">
                    {selectedMovie.title}
                  </h5>
                  <div className="mt-1">
                    {renderStars(rating, true, setRating)}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedMovie(null)}
                  className="text-gray-400 hover:text-white"
                >
                  Remove
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  <Film className="h-4 w-4 mr-2" />
                  Add Movie
                </Button>
              </div>

              <Button
                onClick={handleCreatePost}
                disabled={!newPost.trim() && !selectedMovie}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Post
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post: Post) => (
          <Card key={post.id} className="border-gray-800 bg-gray-900/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={post.profiles?.avatar} />
                    <AvatarFallback>
                      {post.profiles?.username?.[0] ||
                        post.profiles?.full_name?.[0] ||
                        "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-white">
                      {post.profiles?.full_name ||
                        post.profiles?.username ||
                        "Anonymous"}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {formatTimeAgo(post.created_at)}
                    </p>
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Movie attachment */}
              {post.movie_id && (
                <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                  <img
                    src={post.movie_poster}
                    alt={post.movie_title}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h5 className="font-medium text-white">
                      {post.movie_title}
                    </h5>
                    {post.rating && (
                      <div className="mt-1">{renderStars(post.rating)}</div>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-red-600/20 text-red-400"
                  >
                    Review
                  </Badge>
                </div>
              )}

              {/* Post content */}
              {post.content && (
                <p className="text-white leading-relaxed">{post.content}</p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                <div className="flex items-center space-x-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleLike(post.id)}
                    className={cn(
                      "text-gray-400 hover:text-red-400 transition-colors",
                      post.is_liked && "text-red-400",
                    )}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4 mr-1",
                        post.is_liked && "fill-current",
                      )}
                    />
                    {post.likes_count}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setActiveComments(
                        activeComments === post.id ? null : post.id,
                      )
                    }
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.comments_count}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleBookmark(post.id)}
                  className={cn(
                    "text-gray-400 hover:text-yellow-400 transition-colors",
                    post.is_bookmarked && "text-yellow-400",
                  )}
                >
                  <Bookmark
                    className={cn(
                      "h-4 w-4",
                      post.is_bookmarked && "fill-current",
                    )}
                  />
                </Button>
              </div>

              {/* Comment section */}
              {activeComments === post.id && (
                <div className="space-y-3 pt-3 border-t border-gray-800">
                  {user && (
                    <div className="flex space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-xs">
                          {user.username?.[0] || user.email?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          placeholder="Write a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white resize-none"
                          rows={2}
                        />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleComment(post.id)}
                            disabled={!newComment.trim()}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="text-center py-12">
            <Film className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No posts yet
            </h3>
            <p className="text-gray-400 mb-4">
              Be the first to share your movie thoughts!
            </p>
            {user && (
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Create First Post
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
