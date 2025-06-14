
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
          <span className="text-white/60 text-sm bg-primary px-2 py-1 rounded">
            {currentSource.name}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={reloadPlayer}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={toggleFullscreen}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <Maximize className="h-4 w-4" />
          </Button>
          
          {onClose && (
            <Button
              onClick={onClose}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative">
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <ProductionLoadingSpinner 
              size="lg" 
              text={`Loading ${getDisplayTitle()}...`}
              showLogo={true}
            />
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="text-center max-w-md mx-auto p-6">
              <p className="text-white mb-4 text-xl">Playback Error</p>
              <p className="text-white/70 mb-6">Failed to load from {currentSource.name}</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={switchSource} variant="default">
                  <SkipForward className="h-4 w-4 mr-2" />
                  Try Next Source
                </Button>
                <Button onClick={reloadPlayer} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Video Iframe */}
        <iframe
          ref={iframeRef}
          src={`${currentUrl}&t=${resumeFrom}`}
          title={getDisplayTitle()}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Source Selector */}
      <div className="p-4 bg-black/80 backdrop-blur-sm">
        <div className="flex gap-2 overflow-x-auto">
          {streamingSources.slice(0, 8).map((source, index) => (
            <Button
              key={source.name}
              onClick={() => setCurrentSourceIndex(index)}
              size="sm"
              variant={index === currentSourceIndex ? "default" : "outline"}
              className={`flex-shrink-0 text-xs ${
                index === currentSourceIndex 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-black/50 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              {source.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
