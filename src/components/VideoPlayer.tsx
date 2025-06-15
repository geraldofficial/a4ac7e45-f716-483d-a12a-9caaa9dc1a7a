
import React from 'react';
import { SimpleVideoPlayer } from './SimpleVideoPlayer';
import { watchHistoryService } from '@/services/watchHistory';

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

export const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  // Get resume information if shouldResume is true
  let resumeFrom = 0;
  
  if (props.shouldResume) {
    const resumeInfo = watchHistoryService.getResumeInfo(
      props.tmdbId, 
      props.type, 
      props.season, 
      props.episode
    );
    
    if (resumeInfo.shouldResume) {
      resumeFrom = resumeInfo.progress;
      console.log(`Resuming ${props.title} from ${Math.floor(resumeFrom)}s`);
    }
  }

  return (
    <SimpleVideoPlayer
      title={props.title}
      tmdbId={props.tmdbId}
      type={props.type}
      season={props.season}
      episode={props.episode}
      poster_path={props.poster_path}
      backdrop_path={props.backdrop_path}
      duration={props.duration}
      resumeFrom={resumeFrom}
      onProgress={props.onProgress}
      onComplete={props.onComplete}
      onClose={props.onClose}
    />
  );
};
