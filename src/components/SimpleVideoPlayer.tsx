
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { streamingSources, getStreamingUrl } from '@/services/streaming';
import { watchHistoryService } from '@/services/watchHistory';
import { SkipForward, RotateCcw, X, Maximize } from 'lucide-react';
import { ProductionLoadingSpinner } from './ProductionLoadingSpinner';

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
  onClose
}) => {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasStartedWatching, setHasStartedWatching] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentUrl = getStreamingUrl(tmdbId, type, currentSourceIndex, season, episode);
  const currentSource = streamingSources[currentSourceIndex];

  // Add to watch history when component mounts
  useEffect(() => {
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
  }, []);

  const switchSource = () => {
    const nextIndex = (currentSourceIndex + 1) % streamingSources.length;
    setCurrentSourceIndex(nextIndex);
    setHasError(false);
    setIsLoading(true);
  };

  const reloadPlayer = () => {
    setIsLoading(true);
    setHasError(false);
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl;
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  };

  const handleIframeLoad = () => {
    setTimeout(() => {
      setIsLoading(false);
      setHasError(false);
    }, 2000);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const getDisplayTitle = () => {
    if (type === 'tv' && season && episode) {
      return `${title} - S${season}E${episode}`;
    }
    return title;
  };

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-white text-lg font-semibold">{getDisplayTitle()}</h1>
          <span className="text-gray-400 text-sm">via {currentSource.name}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={switchSource}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Switch Source
          </Button>
          
          <Button
            onClick={reloadPlayer}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reload
          </Button>
          
          <Button
            onClick={toggleFullscreen}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Maximize className="h-4 w-4" />
          </Button>
          
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Player Content */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <ProductionLoadingSpinner />
          </div>
        )}

        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center text-white">
              <h2 className="text-xl mb-4">Failed to load video</h2>
              <p className="text-gray-400 mb-6">
                There was an issue loading the video from {currentSource.name}
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={reloadPlayer} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={switchSource}>
                  <SkipForward className="h-4 w-4 mr-2" />
                  Switch Source
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={currentUrl}
            className="w-full h-full border-0"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={`Playing ${title}`}
          />
        )}
      </div>
    </div>
  );
};
