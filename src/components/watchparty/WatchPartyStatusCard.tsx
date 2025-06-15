
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Play, Pause, Wifi, WifiOff } from 'lucide-react';

interface WatchPartyStatusCardProps {
  participantCount: number;
  isPlaying: boolean;
  isConnected: boolean;
  isHost: boolean;
  movieTitle: string;
  compact?: boolean;
}

export const WatchPartyStatusCard: React.FC<WatchPartyStatusCardProps> = ({
  participantCount,
  isPlaying,
  isConnected,
  isHost,
  movieTitle,
  compact = false
}) => {
  return (
    <div className={`space-y-3 ${compact ? 'text-xs' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-muted-foreground`} />
          <span className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
            {participantCount} {participantCount === 1 ? 'viewer' : 'viewers'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-green-500`} />
          ) : (
            <WifiOff className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-red-500`} />
          )}
          <Badge variant={isHost ? "default" : "secondary"} className={compact ? 'text-xs px-1 py-0' : ''}>
            {isHost ? 'Host' : 'Guest'}
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {isPlaying ? (
          <Play className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-green-500`} />
        ) : (
          <Pause className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-yellow-500`} />
        )}
        <span className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
          {isPlaying ? 'Playing' : 'Paused'}
        </span>
      </div>
      
      {!compact && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground truncate">
            Watching: {movieTitle}
          </p>
        </div>
      )}
    </div>
  );
};
