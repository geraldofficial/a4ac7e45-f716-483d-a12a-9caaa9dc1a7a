
import React from 'react';
import { SimpleVideoPlayer } from './SimpleVideoPlayer';
import { watchHistoryService } from '@/services/watchHistory';
import { ErrorBoundary } from './ErrorBoundary';

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
    try {
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
    } catch (error) {
      console.error('Error getting resume info:', error);
      resumeFrom = 0;
    }
  }

  return (
    <ErrorBoundary fallback={
      <div className="w-full h-64 bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-lg mb-2">Video player unavailable</p>
          <p className="text-sm text-gray-400">Please try refreshing the page</p>
        </div>
      </div>
    }>
      <SimpleVideoPlayer {...props} resumeFrom={resumeFrom} />
    </ErrorBoundary>
  );
};
