import React from 'react';
import { NetflixVideoPlayer } from './video/NetflixVideoPlayer';

interface DetailPageVideoPlayerProps {
  isPlaying: boolean;
  title: string;
  contentId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  posterPath?: string;
  backdropPath?: string;
  duration?: number;
  shouldResume: boolean;
  onClose: () => void;
}

export const DetailPageVideoPlayer: React.FC<DetailPageVideoPlayerProps> = ({
  isPlaying,
  title,
  contentId,
  type,
  season,
  episode,
  posterPath,
  onClose
}) => {
  if (!isPlaying) return null;

  const displayTitle = type === 'tv' && season && episode
    ? `${title} - Season ${season} Episode ${episode}`
    : title;

  return (
    <NetflixVideoPlayer
      title={displayTitle}
      tmdbId={contentId}
      type={type}
      season={season}
      episode={episode}
      posterPath={posterPath}
      onClose={onClose}
    />
  );
};
