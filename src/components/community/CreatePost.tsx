
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image, Video, X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreatePostProps {
  onClose: () => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onClose }) => {
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

    // Create preview URLs
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setMediaPreview(prev => [...prev, url]);
    });
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreview(prev => {
      const newPreview = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]); // Clean up memory
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Post created!",
        description: "Your post has been shared with the community.",
      });
      
      // Reset form
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
      <CardHeader>
        <CardTitle>Create Post</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                U
              </div>
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-24 resize-none border-none shadow-none text-lg placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </div>
        </div>

        {/* Media Preview */}
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
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeMedia(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
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
              className="gap-2"
            >
              <Image className="h-4 w-4" />
              Photo
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Video className="h-4 w-4" />
              Video
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isPosting}>
              Cancel
            </Button>
            <Button onClick={handlePost} disabled={isPosting}>
              {isPosting ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
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
