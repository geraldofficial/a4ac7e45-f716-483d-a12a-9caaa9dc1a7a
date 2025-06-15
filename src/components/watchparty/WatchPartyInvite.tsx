
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Share, Link, QrCode, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WatchPartyInviteProps {
  sessionId: string;
  movieTitle: string;
  onCopyCode: () => void;
  copied: boolean;
}

export const WatchPartyInvite: React.FC<WatchPartyInviteProps> = ({
  sessionId,
  movieTitle,
  onCopyCode,
  copied
}) => {
  const [shareUrl] = useState(`${window.location.origin}/watch-party/${sessionId}`);
  const { toast } = useToast();

  const shareInvite = async () => {
    const shareText = `🎬 Join my watch party for "${movieTitle}"!\n\n🔑 Party Code: ${sessionId}\n🔗 Link: ${shareUrl}\n\nLet's watch together!`;
    
    try {
      if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        await navigator.share({
          title: `Watch Party: ${movieTitle}`,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Invite copied!",
          description: "Share this with friends to join your watch party.",
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Invite copied!",
          description: "Share with friends to join your watch party.",
        });
      } catch (clipboardError) {
        toast({
          title: "Unable to share",
          description: "Please manually share the party code with friends.",
          variant: "destructive",
        });
      }
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share this link with friends.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
      <div className="text-center">
        <h4 className="text-lg font-semibold text-white mb-2">Invite Friends</h4>
        <p className="text-sm text-gray-400">Share your watch party with friends</p>
      </div>

      {/* Party Code */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Party Code</label>
        <div className="flex gap-2">
          <Input
            value={sessionId}
            readOnly
            className="bg-gray-700/50 border-gray-600/50 text-white font-mono text-lg text-center"
          />
          <Button
            onClick={onCopyCode}
            size="sm"
            variant="outline"
            className="border-gray-600/50 text-gray-300 hover:text-white hover:bg-gray-700/50"
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Share Link */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Share Link</label>
        <div className="flex gap-2">
          <Input
            value={shareUrl}
            readOnly
            className="bg-gray-700/50 border-gray-600/50 text-white text-sm"
          />
          <Button
            onClick={copyLink}
            size="sm"
            variant="outline"
            className="border-gray-600/50 text-gray-300 hover:text-white hover:bg-gray-700/50"
          >
            <Link className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={shareInvite}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
        >
          <Share className="h-4 w-4 mr-2" />
          Share Invite
        </Button>
      </div>
    </div>
  );
};
