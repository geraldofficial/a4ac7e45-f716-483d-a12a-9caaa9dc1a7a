import React, { useState, useEffect } from 'react';
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
  onEpisodeChange?: (season: number, episode: number) => void;
}

export const DetailPageVideoPlayer: React.FC<DetailPageVideoPlayerProps> = ({
  isPlaying,
  title,
  contentId,
  type,
  season = 1,
  episode = 1,
  posterPath,
  onClose,
  onEpisodeChange
}) => {
  const [currentSeason, setCurrentSeason] = useState(season);
  const [currentEpisode, setCurrentEpisode] = useState(episode);

  useEffect(() => {
    setCurrentSeason(season);
    setCurrentEpisode(episode);
  }, [season, episode]);

  if (!isPlaying) return null;

  return (
    <NetflixVideoPlayer
      title={title}
      tmdbId={contentId}
      type={type}
      season={type === 'tv' ? currentSeason : undefined}
      episode={type === 'tv' ? currentEpisode : undefined}
      posterPath={posterPath}
      onClose={onClose}
    />
  );
};
