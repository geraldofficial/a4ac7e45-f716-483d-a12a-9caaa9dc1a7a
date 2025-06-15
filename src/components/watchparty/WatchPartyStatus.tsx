
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Play, Pause, Wifi, WifiOff } from 'lucide-react';

interface WatchPartyStatusProps {
  participantCount: number;
  isPlaying: boolean;
  isConnected: boolean;
  isHost: boolean;
  movieTitle: string;
}

export const WatchPartyStatus: React.FC<WatchPartyStatusProps> = ({
  participantCount,
  isPlaying,
  isConnected,
  isHost,
  movieTitle
}) => {
  return (
    <div className="space-y-2">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Wifi className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              <WifiOff className="h-3 w-3 mr-1" />
              Disconnected
            </Badge>
          )}
          
          {isHost && (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              Host
            </Badge>
          )}
        </div>

        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          <Users className="h-3 w-3 mr-1" />
          {participantCount} watching
        </Badge>
      </div>

      {/* Playback Status */}
      <div className="flex items-center gap-2">
        <Badge className={`${isPlaying ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
          {isPlaying ? <Play className="h-3 w-3 mr-1" /> : <Pause className="h-3 w-3 mr-1" />}
          {isPlaying ? 'Playing' : 'Paused'}
        </Badge>
        
        <span className="text-xs text-gray-400 truncate max-w-[200px]">
          {movieTitle}
        </span>
      </div>
    </div>
  );
};
