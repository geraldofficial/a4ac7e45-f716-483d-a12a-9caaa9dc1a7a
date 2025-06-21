import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  ImageIcon,
  Video,
  Upload,
  X,
  Send,
  Trash2,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import {
  communityService,
  CommunityPost,
  CommunityComment,
} from "@/services/community";
import { cn, formatError } from "@/lib/utils";
import { toast } from "sonner";

interface FullFunctionalCommunityFeedProps {
  className?: string;
  searchQuery?: string;
  filter?: string;
}

export const FullFunctionalCommunityFeed: React.FC<
  FullFunctionalCommunityFeedProps
> = ({ className, searchQuery = "", filter = "all" }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [comments, setComments] = useState<{
    [postId: string]: CommunityComment[];
  }>({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Post creation state
  const [newPost, setNewPost] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  // UI state
  const [activeComments, setActiveComments] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{
    [postId: string]: string;
  }>({});

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      let fetchedPosts: CommunityPost[];

      if (searchQuery.trim()) {
        fetchedPosts = await communityService.searchPosts(
          searchQuery,
          user?.id,
        );
      } else {
        fetchedPosts = await communityService.fetchPosts(user?.id);
      }

      // Apply client-side filtering for now
      if (filter === "trending") {
        fetchedPosts = fetchedPosts
          .sort(
            (a, b) =>
              b.likes_count +
              b.comments_count -
              (a.likes_count + a.comments_count),
          )
          .slice(0, 20);
      } else if (filter === "movies") {
        fetchedPosts = fetchedPosts.filter(
          (post) =>
            post.content.toLowerCase().includes("movie") ||
            post.content.toLowerCase().includes("film") ||
            post.movie_title,
        );
      }

      setPosts(fetchedPosts);
    } catch (error) {
      toast.error(`Failed to load posts: ${formatError(error)}`);
    } finally {
      setLoading(false);
    }
  }, [user?.id, searchQuery, filter]);

  // Fetch comments for a post
  const fetchComments = async (postId: string) => {
    try {
      const postComments = await communityService.fetchComments(postId);
      setComments((prev) => ({ ...prev, [postId]: postComments }));
    } catch (error) {
      toast.error(`Failed to load comments: ${formatError(error)}`);
    }
  };

  // Media upload
  const handleMediaUpload = async (files: FileList) => {
    if (!user) return;

    try {
      setUploading(true);
      const uploadPromises = Array.from(files).map((file) =>
        communityService.uploadMedia(file, user.id),
      );

      const urls = await Promise.all(uploadPromises);
      setMediaUrls((prev) => [...prev, ...urls]);
      setMediaFiles((prev) => [...prev, ...Array.from(files)]);

      toast.success(`${files.length} file(s) uploaded successfully!`);
    } catch (error) {
      toast.error(`Failed to upload media: ${formatError(error)}`);
    } finally {
      setUploading(false);
    }
  };

  // Create post
  const handleCreatePost = async () => {
    if (!user || (!newPost.trim() && mediaUrls.length === 0)) {
      toast.error("Please add some content to your post");
      return;
    }

    try {
      setCreating(true);

      await communityService.createPost({
        user_id: user.id,
        content: newPost.trim(),
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
      });

      // Reset form
      setNewPost("");
      setMediaFiles([]);
      setMediaUrls([]);

      // Refresh posts
      await fetchPosts();

      toast.success("Post created successfully!");
    } catch (error) {
      toast.error(`Failed to create post: ${formatError(error)}`);
    } finally {
      setCreating(false);
    }
  };

  // Handle like
  const handleLike = async (postId: string) => {
    if (!user) {
      toast.error("Please sign in to like posts");
      return;
    }

    try {
      const isLiked = await communityService.toggleLike(postId, user.id);

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                is_liked: isLiked,
                likes_count: isLiked
                  ? post.likes_count + 1
                  : post.likes_count - 1,
              }
            : post,
        ),
      );
    } catch (error) {
      toast.error(`Failed to like post: ${formatError(error)}`);
    }
  };

  // Handle bookmark
  const handleBookmark = async (postId: string) => {
    if (!user) {
      toast.error("Please sign in to bookmark posts");
      return;
    }

    try {
      const isBookmarked = await communityService.toggleBookmark(
        postId,
        user.id,
      );

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, is_bookmarked: isBookmarked } : post,
        ),
      );

      toast.success(isBookmarked ? "Post bookmarked!" : "Bookmark removed");
    } catch (error) {
      toast.error(`Failed to bookmark post: ${formatError(error)}`);
    }
  };

  // Handle comment
  const handleComment = async (postId: string) => {
    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }

    const content = commentInputs[postId]?.trim();
    if (!content) return;

    try {
      await communityService.createComment(postId, user.id, content);

      // Update comment count
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, comments_count: post.comments_count + 1 }
            : post,
        ),
      );

      // Clear input
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));

      // Refresh comments if showing
      if (activeComments === postId) {
        await fetchComments(postId);
      }

      toast.success("Comment added!");
    } catch (error) {
      toast.error(`Failed to add comment: ${formatError(error)}`);
    }
  };

  // Handle delete post
  const handleDeletePost = async (postId: string) => {
    try {
      await communityService.deletePost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error(`Failed to delete post: ${formatError(error)}`);
    }
  };

  // Handle share post
  const handleShare = async (postId: string) => {
    try {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      if (navigator.share) {
        await navigator.share({
          title: "FlickPick Community Post",
          text: post.content,
          url: `${window.location.origin}/community#post-${postId}`,
        });
        toast.success("Post shared successfully");
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(
          `Check out this post on FlickPick: ${post.content} - ${window.location.origin}/community#post-${postId}`,
        );
        toast.success("Post link copied to clipboard");
      }
    } catch (error) {
      console.warn("Share failed:", error);
      toast.error("Failed to share post");
    }
  };

  // Handle toggle comments
  const handleToggleComments = async (postId: string) => {
    if (activeComments === postId) {
      setActiveComments(null);
    } else {
      setActiveComments(postId);
      if (!comments[postId]) {
        await fetchComments(postId);
      }
    }
  };

  // Time formatting
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

  // Effects
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card
            key={i}
            className="animate-pulse border-gray-800 bg-gray-900/50"
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-24" />
                  <div className="h-3 bg-gray-700 rounded w-16" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded" />
                <div className="h-4 bg-gray-700 rounded w-2/3" />
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
              placeholder="What's on your mind about movies and shows?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white resize-none min-h-[100px]"
              rows={4}
            />

            {/* Media Preview */}
            {mediaUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {mediaUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    {mediaFiles[index]?.type.startsWith("video/") ? (
                      <video
                        src={url}
                        className="w-full h-32 object-cover rounded-lg"
                        controls
                      />
                    ) : (
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setMediaUrls((prev) =>
                          prev.filter((_, i) => i !== index),
                        );
                        setMediaFiles((prev) =>
                          prev.filter((_, i) => i !== index),
                        );
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) =>
                    e.target.files && handleMediaUpload(e.target.files)
                  }
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-gray-700 text-gray-400"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Media
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("/browse", "_blank")}
                  className="border-gray-700 text-gray-400"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Watch Party
                </Button>
              </div>

              <Button
                onClick={handleCreatePost}
                disabled={
                  creating || (!newPost.trim() && mediaUrls.length === 0)
                }
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {creating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : null}
                {creating ? "Posting..." : "Post"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
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

                {user && user.id === post.user_id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-gray-400 hover:text-white"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-900 border-gray-800">
                      <DropdownMenuItem
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Post content */}
              {post.content && (
                <p className="text-white leading-relaxed">{post.content}</p>
              )}

              {/* Media */}
              {post.media_urls && post.media_urls.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {post.media_urls.map((url, index) => (
                    <div key={index} className="rounded-lg overflow-hidden">
                      {url.includes(".mp4") ||
                      url.includes(".webm") ||
                      url.includes(".mov") ||
                      url.includes(".avi") ? (
                        <video
                          src={url}
                          className="w-full h-64 object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={url}
                          alt={`Post media ${index + 1}`}
                          className="w-full h-64 object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
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
                    onClick={() => handleToggleComments(post.id)}
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.comments_count}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleShare(post.id)}
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

              {/* Comments section */}
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
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Write a comment..."
                            value={commentInputs[post.id] || ""}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleComment(post.id)
                            }
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                          <Button
                            size="icon"
                            onClick={() => handleComment(post.id)}
                            disabled={!commentInputs[post.id]?.trim()}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comments list */}
                  <div className="space-y-3">
                    {comments[post.id]?.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.profiles?.avatar} />
                          <AvatarFallback className="text-xs">
                            {comment.profiles?.username?.[0] ||
                              comment.profiles?.full_name?.[0] ||
                              "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-white">
                              {comment.profiles?.full_name ||
                                comment.profiles?.username ||
                                "Anonymous"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatTimeAgo(comment.created_at)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-300 mt-1 break-words">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {searchQuery ? "No posts found" : "No posts yet"}
            </h3>
            <p className="text-gray-400 mb-4">
              {searchQuery
                ? `No posts match "${searchQuery}". Try a different search term.`
                : "Be the first to share your movie thoughts!"}
            </p>
            {user && !searchQuery && (
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
