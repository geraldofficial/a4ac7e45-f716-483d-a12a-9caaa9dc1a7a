
import React from 'react';
import { FixedVideoPlayer } from './FixedVideoPlayer';

interface EnhancedVideoPlayerCoreProps {
  title: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  resumeFrom?: number;
  onProgress?: (currentTime: number, duration: number) => void;
  onError?: (error: string) => void;
  onSourceChange?: (sourceIndex: number) => void;
  onCastToggle?: (isCasting: boolean) => void;
}

export const EnhancedVideoPlayerCore: React.FC<EnhancedVideoPlayerCoreProps> = (props) => {
  return <FixedVideoPlayer {...props} />;
};
