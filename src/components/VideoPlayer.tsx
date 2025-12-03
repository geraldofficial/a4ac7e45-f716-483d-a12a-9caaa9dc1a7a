import React from 'react';
import { NetflixVideoPlayer } from './video/NetflixVideoPlayer';

interface VideoPlayerProps {
  title: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  autoFullscreen?: boolean;
  poster_path?: string;
  backdrop_path?: string;
  duration?: number;
  shouldResume?: boolean;
  onProgress?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  onClose?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  title,
  tmdbId,
  type,
  season,
  episode,
  poster_path,
  onClose,
}) => {
  return (
    <NetflixVideoPlayer
      title={title}
      tmdbId={tmdbId}
      type={type}
      season={season}
      episode={episode}
      posterPath={poster_path}
      onClose={onClose}
    />
  );
};
