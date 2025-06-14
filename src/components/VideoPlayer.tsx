
import React from 'react';
import { EnhancedVideoPlayer } from './EnhancedVideoPlayer';

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
}

export const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  return <EnhancedVideoPlayer {...props} />;
};
