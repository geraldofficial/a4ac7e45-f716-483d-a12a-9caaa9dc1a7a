
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, MessageCircle, Share, Copy, Check } from 'lucide-react';
import { EnhancedWatchPartySession } from '@/services/enhancedDatabaseWatchParty';

interface EnhancedWatchPartyHeaderProps {
  session: EnhancedWatchPartySession;
  isHost: boolean;
  showChat: boolean;
  copied: boolean;
  onToggleChat: () => void;
  onShare: () => void;
  onCopyCode: () => void;
  onClose: () => void;
}

export const EnhancedWatchPartyHeader: React.FC<EnhancedWatchPartyHeaderProps> = ({
  session,
  isHost,
  showChat,
  copied,
  onToggleChat,
  onShare,
  onCopyCode,
  onClose
}) => {
  return (
    <div className="p-4 border-b border-gray-700 bg-gray-800/50 backdrop-blur">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white text-sm">Watch Party</h3>
          {isHost && (
            <Badge variant="secondary" className="text-xs bg-blue-600 text-white">
              Host
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <p className="text-xs text-gray-300 truncate">{session.movie_title}</p>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs text-gray-300 border-gray-600">
            {session.id}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopyCode}
            className="h-6 px-2 text-xs text-gray-400 hover:text-white"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleChat}
            className="flex-1 h-8 text-xs border-gray-600 text-gray-300 hover:text-white"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            {showChat ? 'Hide Chat' : 'Show Chat'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="h-8 px-3 text-xs border-gray-600 text-gray-300 hover:text-white"
          >
            <Share className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
