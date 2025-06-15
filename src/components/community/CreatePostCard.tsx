
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Image, Video, X, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunity } from '@/hooks/useCommunity';
import { useToast } from '@/hooks/use-toast';

export const CreatePostCard: React.FC = () => {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { createPost } = useCommunity();
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
    await createPost(content, mediaFiles);
    
    // Reset form
    setContent('');
    setMediaFiles([]);
    setMediaPreview(prev => {
      prev.forEach(url => URL.revokeObjectURL(url));
      return [];
    });
    setIsPosting(false);
  };

  if (!user) return null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={user.avatar || user.image} />
            <AvatarFallback>
              {user.full_name?.charAt(0) || user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-20 resize-none border-none shadow-none text-base placeholder:text-muted-foreground focus-visible:ring-0 p-0"
            />

            {mediaPreview.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {mediaPreview.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      {mediaFiles[index]?.type.startsWith('image/') ? (
                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <video src={url} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeMedia(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
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
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Image className="h-4 w-4" />
                  <span className="hidden sm:inline">Photo</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Video className="h-4 w-4" />
                  <span className="hidden sm:inline">Video</span>
                </Button>
              </div>
              
              <Button 
                onClick={handlePost} 
                disabled={isPosting || (!content.trim() && mediaFiles.length === 0)}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isPosting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
