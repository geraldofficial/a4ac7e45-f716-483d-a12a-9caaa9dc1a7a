
import React from 'react';
import { FullFeaturedVideoPlayer } from './FullFeaturedVideoPlayer';
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
    <FullFeaturedVideoPlayer {...props} resumeFrom={resumeFrom} />
  );
};
