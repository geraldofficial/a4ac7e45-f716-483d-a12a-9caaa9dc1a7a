
import React, { useMemo } from 'react';
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
  // Memoize the display title calculation to prevent unnecessary re-renders
  const displayTitle = useMemo(() => {
    if (type === 'tv' && season && episode) {
      return `${title} - Season ${season} Episode ${episode}`;
    }
    return title;
  }, [title, type, season, episode]);

  // Memoize the duration calculation
  const videoDuration = useMemo(() => {
    return duration ? duration * 60 : undefined;
  }, [duration]);

  if (!isPlaying) return null;

  return (
    <VideoPlayer
      title={displayTitle}
      tmdbId={contentId}
      type={type}
      season={season}
      episode={episode}
      poster_path={posterPath}
      backdrop_path={backdropPath}
      duration={videoDuration}
      shouldResume={shouldResume}
      onClose={onClose}
    />
  );
};
