
import React from 'react';
import { MatureWatchParty } from './MatureWatchParty';

interface WatchPartyProps {
  movieId: number;
  movieTitle: string;
  movieType: 'movie' | 'tv';
  onClose: () => void;
  onPlaybackSync?: (data: { position: number; isPlaying: boolean; timestamp: string }) => void;
  currentPlaybackTime?: number;
  isCurrentlyPlaying?: boolean;
  videoDuration?: number;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  onSeek?: (time: number) => void;
  onPlayPause?: () => void;
}

export const WatchParty: React.FC<WatchPartyProps> = (props) => {
  return <MatureWatchParty {...props} />;
};
