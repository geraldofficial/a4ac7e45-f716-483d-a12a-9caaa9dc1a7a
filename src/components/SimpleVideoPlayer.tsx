
import React, { useState, useRef } from 'react';
import { VideoPlayerCore } from './video/VideoPlayerCore';
import { VideoPlayerControls } from './video/VideoPlayerControls';
import { VideoLoadingState } from './video/VideoLoadingState';
import { watchHistoryService } from '@/services/watchHistory';
import { streamingSources } from '@/services/streaming';

interface SimpleVideoPlayerProps {
  title: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  poster_path?: string;
  backdrop_path?: string;
  duration?: number;
  resumeFrom?: number;
  onProgress?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  onClose?: () => void;
}

export const SimpleVideoPlayer: React.FC<SimpleVideoPlayerProps> = ({
  title,
  tmdbId,
  type,
  season,
  episode,
  poster_path,
  backdrop_path,
  duration,
  resumeFrom = 0,
  onProgress,
  onComplete,
  onClose
}) => {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasStartedWatching, setHasStartedWatching] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const currentSource = streamingSources[currentSourceIndex];

  // Add to watch history on first load
  React.useEffect(() => {
    if (!hasStartedWatching) {
      watchHistoryService.addToHistory({
        tmdbId,
        type,
        title,
        poster_path,
        backdrop_path,
        season,
        episode,
        progress: resumeFrom,
        duration,
        lastSource: currentSource.name
      });
      setHasStartedWatching(true);
    }
  }, [hasStartedWatching, tmdbId, type, title, poster_path, backdrop_path, season, episode, resumeFrom, duration, currentSource.name]);

  const getDisplayTitle = () => {
    if (type === 'tv' && season && episode) {
      return `${title} - S${season}E${episode}`;
    }
    return title;
  };

  const handleSourceChange = (index: number) => {
    setCurrentSourceIndex(index);
    setHasError(false);
    setIsLoading(true);
  };

  const handleReload = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  };

  const handleError = (error: string) => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleProgress = (currentTime: number, duration: number) => {
    onProgress?.(currentTime, duration);
    // Update watch history periodically
    watchHistoryService.updateProgress(tmdbId, type, currentTime, duration, season, episode);
  };

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      <VideoPlayerControls
        title={getDisplayTitle()}
        currentSourceIndex={currentSourceIndex}
        onSourceChange={handleSourceChange}
        onReload={handleReload}
        onFullscreen={handleFullscreen}
        onClose={onClose}
        hasError={hasError}
      />

      <div className="flex-1 relative">
        {isLoading && (
          <VideoLoadingState
            title={getDisplayTitle()}
            message="Preparing your video..."
          />
        )}

        <VideoPlayerCore
          title={title}
          tmdbId={tmdbId}
          type={type}
          season={season}
          episode={episode}
          resumeFrom={resumeFrom}
          onProgress={handleProgress}
          onError={handleError}
          onSourceChange={(index) => setCurrentSourceIndex(index)}
        />
      </div>
    </div>
  );
};
