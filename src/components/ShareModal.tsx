
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Copy, Users, Share, Twitter, Facebook, MessageCircle, Smartphone } from 'lucide-react';
import { contentSharingService, ShareableContent } from '@/services/contentSharing';
import { useToast } from '@/hooks/use-toast';

interface ShareModalProps {
  content: ShareableContent;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ content, onClose }) => {
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      await contentSharingService.shareContent(content);
      toast({
        title: "Shared successfully!",
        description: "Content has been shared."
      });
      onClose();
    } catch (error) {
      toast({
        title: "Link copied!",
        description: "Share link has been copied to your clipboard."
      });
      onClose();
    }
  };

  const handleSocialShare = (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    contentSharingService.shareToSocial(content, platform);
    onClose();
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/${content.type}/${content.id}`;
    await navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Share link has been copied to your clipboard."
    });
    onClose();
  };

  const handleWatchPartyLink = async () => {
    const partyLink = contentSharingService.generateWatchPartyLink(content.id, content.title);
    await navigator.clipboard.writeText(partyLink);
    toast({
      title: "Watch party link copied!",
      description: "Share this link to start a watch party."
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="p-6 max-w-sm w-full bg-gray-900 border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Share</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4">
          <h4 className="font-medium mb-2 text-white">{content.title}</h4>
          {content.description && (
            <p className="text-sm text-gray-400 line-clamp-2">
              {content.description}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Button onClick={handleShare} className="w-full justify-start bg-gray-800 hover:bg-gray-700 text-white border-gray-600">
            <Smartphone className="h-4 w-4 mr-3" />
            <span>Share</span>
          </Button>

          <Button variant="outline" onClick={handleCopyLink} className="w-full justify-start border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800">
            <Copy className="h-4 w-4 mr-3" />
            <span>Copy Link</span>
          </Button>

          <Button variant="outline" onClick={handleWatchPartyLink} className="w-full justify-start border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800">
            <Users className="h-4 w-4 mr-3" />
            <span>Create Watch Party</span>
          </Button>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => handleSocialShare('twitter')}
              className="p-3 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
              title="Share on Twitter"
            >
              <Twitter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare('facebook')}
              className="p-3 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
              title="Share on Facebook"
            >
              <Facebook className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare('whatsapp')}
              className="p-3 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
              title="Share on WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
