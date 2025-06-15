
import React from 'react';
import { VideoPlayer } from './VideoPlayer';

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
  backdropPath,
  duration,
  shouldResume,
  onClose
}) => {
  // Get display title with episode info for TV shows
  const getDisplayTitle = () => {
    if (type === 'tv' && season && episode) {
      return `${title} - Season ${season} Episode ${episode}`;
    }
    return title;
  };

  if (!isPlaying) return null;

  return (
    <VideoPlayer
      title={getDisplayTitle()}
      tmdbId={contentId}
      type={type}
      season={season}
      episode={episode}
      poster_path={posterPath}
      backdrop_path={backdropPath}
      duration={duration ? duration * 60 : undefined}
      shouldResume={shouldResume}
      onClose={onClose}
    />
  );
};
