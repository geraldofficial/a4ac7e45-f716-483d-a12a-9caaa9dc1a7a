
import React from 'react';
import { EnhancedWatchParty } from './EnhancedWatchParty';

interface WatchPartyProps {
  movieId: number;
  movieTitle: string;
  movieType: 'movie' | 'tv';
  onClose: () => void;
}

export const WatchParty: React.FC<WatchPartyProps> = (props) => {
  return <EnhancedWatchParty {...props} />;
};
