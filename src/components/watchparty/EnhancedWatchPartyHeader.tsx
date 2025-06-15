
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, MessageCircle, Share, X, Link, Copy, Check, Crown } from 'lucide-react';
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
    <div className="p-6 md:p-4 border-b border-gray-700 bg-gradient-to-r from-red-900/30 to-gray-800 md:rounded-t-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 md:w-10 md:h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl md:rounded-full flex items-center justify-center shadow-lg">
            <Users className="h-6 w-6 md:h-5 md:w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl md:text-base font-bold text-white flex items-center gap-2">
              Watch Party
              {isHost && <Crown className="h-4 w-4 text-yellow-400" />}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm md:text-xs bg-green-500/20 text-green-400 px-3 py-1 md:px-2 rounded-full font-semibold border border-green-500/30">
                {session.participants.length} watching
              </span>
              {isHost && (
                <span className="text-sm md:text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1 md:px-2 rounded-full font-semibold border border-yellow-500/30">
                  Host
                </span>
              )}
              {session.is_playing && (
                <span className="text-sm md:text-xs bg-blue-500/20 text-blue-400 px-3 py-1 md:px-2 rounded-full font-semibold border border-blue-500/30">
                  Playing
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleChat}
            className={`text-gray-300 hover:text-white hover:bg-white/10 h-12 w-12 md:h-8 md:w-8 p-0 rounded-xl md:rounded-full transition-all ${showChat ? 'bg-white/10 text-white' : ''}`}
          >
            <MessageCircle className="h-6 w-6 md:h-4 md:w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onShare}
            className="text-gray-300 hover:text-white hover:bg-white/10 h-12 w-12 md:h-8 md:w-8 p-0 rounded-xl md:rounded-full transition-all"
          >
            <Share className="h-6 w-6 md:h-4 md:w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-gray-300 hover:text-white hover:bg-white/10 h-12 w-12 md:h-8 md:w-8 p-0 rounded-xl md:rounded-full transition-all"
          >
            <X className="h-6 w-6 md:h-4 md:w-4" />
          </Button>
        </div>
      </div>

      {/* Movie Info */}
      <div className="mb-4">
        <h4 className="text-sm md:text-xs text-gray-300 font-medium mb-1">Now Watching</h4>
        <p className="text-white font-semibold text-base md:text-sm truncate">{session.movie_title}</p>
      </div>

      {/* Party Code Section */}
      <div className="bg-gray-800/50 rounded-xl p-4 md:p-3 border border-gray-600/30 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Link className="h-4 w-4 text-gray-400" />
              <span className="text-sm md:text-xs text-gray-400 font-medium">Party Code</span>
            </div>
            <code className="text-2xl md:text-lg font-mono font-bold text-white bg-gray-700/50 px-4 py-3 md:px-3 md:py-2 rounded-lg block border border-gray-600/30 tracking-wider">
              {session.id}
            </code>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopyCode}
            className="text-gray-300 hover:text-white hover:bg-gray-600/50 h-14 w-14 md:h-10 md:w-10 p-0 ml-4 rounded-xl transition-all"
          >
            {copied ? <Check className="h-6 w-6 md:h-5 md:w-5 text-green-400" /> : <Copy className="h-6 w-6 md:h-5 md:w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
