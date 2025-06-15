
import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Image, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunity } from '@/hooks/useCommunity';
import { useToast } from '@/hooks/use-toast';
import { compressMedia } from '@/utils/mediaCompression';

export const MinimalCreatePost: React.FC = () => {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { createPost } = useCommunity();
  const { toast } = useToast();

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsCompressing(true);
    try {
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          try {
            return await compressMedia(file);
          } catch (error) {
            console.error('Compression failed for file:', file.name, error);
            toast({
              title: "Compression failed",
              description: `Failed to compress ${file.name}. File may be too large.`,
              variant: "destructive",
            });
            return null;
          }
        })
      );

      const validFiles = compressedFiles.filter(Boolean) as File[];
      setMediaFiles(prev => [...prev, ...validFiles]);
      
      toast({
        title: "Media compressed",
        description: `${validFiles.length} files compressed and ready to upload.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process media files.",
        variant: "destructive",
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handlePost = async () => {
    if (!content.trim() && mediaFiles.length === 0) return;
    
    setIsPosting(true);
    await createPost(content, mediaFiles);
    setContent('');
    setMediaFiles([]);
    setIsPosting(false);
  };

  if (!user) return null;

  return (
    <Card className="border-0 border-b border-border/50 rounded-none bg-transparent">
      <div className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={user.avatar || user.image} />
            <AvatarFallback className="text-xs">
              {user.full_name?.charAt(0) || user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Share your thoughts about movies..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px] resize-none border-0 shadow-none p-0 text-base placeholder:text-muted-foreground focus-visible:ring-0"
            />

            <div className="flex items-center justify-between">
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
                  disabled={isCompressing}
                  className="h-9 px-3 gap-2 text-muted-foreground hover:text-foreground"
                >
                  {isCompressing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Image className="h-4 w-4" />
                  )}
                  Media
                </Button>
              </div>
              
              <Button 
                onClick={handlePost} 
                disabled={isPosting || (!content.trim() && mediaFiles.length === 0)}
                size="sm"
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isPosting ? 'Posting...' : 'Post'}
              </Button>
            </div>

            {mediaFiles.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {mediaFiles.length} compressed file(s) ready
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
