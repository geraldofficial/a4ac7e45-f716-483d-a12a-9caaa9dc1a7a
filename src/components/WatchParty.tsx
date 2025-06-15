
import React from 'react';
import { FullyFunctionalWatchParty } from './FullyFunctionalWatchParty';

interface WatchPartyProps {
  movieId: number;
  movieTitle: string;
  movieType: 'movie' | 'tv';
  onClose: () => void;
  onPlaybackSync?: (data: { position: number; isPlaying: boolean; timestamp: string }) => void;
  currentPlaybackTime?: number;
  isCurrentlyPlaying?: boolean;
}

export const WatchParty: React.FC<WatchPartyProps> = (props) => {
  return <FullyFunctionalWatchParty {...props} />;
};
