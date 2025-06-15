
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image, Video, X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreatePostProps {
  onClose: () => void;
  onPostCreated?: (post: any) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Only image and video files are allowed.",
        variant: "destructive",
      });
    }

    setMediaFiles(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setMediaPreview(prev => [...prev, url]);
    });
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreview(prev => {
      const newPreview = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]);
      return newPreview;
    });
  };

  const handlePost = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast({
        title: "Empty post",
        description: "Please add some content or media to your post.",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);

    try {
      // Simulate API call - replace with real implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newPost = {
        id: `post-${Date.now()}`,
        user: {
          id: 'current-user',
          name: 'You',
          username: '@you',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser'
        },
        content,
        media: mediaFiles.length > 0 ? mediaFiles.map((file, index) => ({
          type: file.type.startsWith('image/') ? 'image' as const : 'video' as const,
          url: mediaPreview[index]
        })) : undefined,
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date()
      };
      
      if (onPostCreated) {
        onPostCreated(newPost);
      }
      
      toast({
        title: "Post created!",
        description: "Your post has been shared with the community.",
      });
      
      setContent('');
      setMediaFiles([]);
      setMediaPreview([]);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Create Post</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
            <AvatarFallback>
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                U
              </div>
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-20 md:min-h-24 resize-none border-none shadow-none text-sm md:text-base placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </div>
        </div>

        {mediaPreview.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {mediaPreview.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  {mediaFiles[index]?.type.startsWith('image/') ? (
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <video src={url} className="w-full h-full object-cover" />
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeMedia(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-1 md:gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaUpload}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1 md:gap-2 h-8 px-2 md:px-3"
            >
              <Image className="h-4 w-4" />
              <span className="hidden md:inline">Photo</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1 md:gap-2 h-8 px-2 md:px-3"
            >
              <Video className="h-4 w-4" />
              <span className="hidden md:inline">Video</span>
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isPosting} size="sm">
              Cancel
            </Button>
            <Button onClick={handlePost} disabled={isPosting} size="sm">
              {isPosting ? (
                <>
                  <Upload className="h-4 w-4 mr-1 md:mr-2 animate-spin" />
                  <span className="hidden md:inline">Posting...</span>
                  <span className="md:hidden">...</span>
                </>
              ) : (
                'Post'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
