
import React from 'react';
import { DatabaseEnhancedWatchParty } from './DatabaseEnhancedWatchParty';

interface WatchPartyProps {
  movieId: number;
  movieTitle: string;
  movieType: 'movie' | 'tv';
  onClose: () => void;
}

export const WatchParty: React.FC<WatchPartyProps> = (props) => {
  return <DatabaseEnhancedWatchParty {...props} />;
};
