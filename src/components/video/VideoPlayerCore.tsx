
import React, { useState, useEffect, useRef } from 'react';
import { streamingSources, getStreamingUrl } from '@/services/streaming';
import { VideoPlayerState } from './VideoPlayerState';

interface VideoPlayerCoreProps {
  title: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  resumeFrom?: number;
  onProgress?: (currentTime: number, duration: number) => void;
  onError?: (error: string) => void;
  onSourceChange?: (sourceIndex: number) => void;
}

export const VideoPlayerCore: React.FC<VideoPlayerCoreProps> = ({
  title,
  tmdbId,
  type,
  season,
  episode,
  resumeFrom = 0,
  onProgress,
  onError,
  onSourceChange
}) => {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentUrl = getStreamingUrl(tmdbId, type, currentSourceIndex, season, episode);
  const currentSource = streamingSources[currentSourceIndex];

  const switchSource = () => {
    const nextIndex = (currentSourceIndex + 1) % streamingSources.length;
    setCurrentSourceIndex(nextIndex);
    setHasError(false);
    setIsLoading(true);
    onSourceChange?.(nextIndex);
  };

  const reloadPlayer = () => {
    setIsLoading(true);
    setHasError(false);
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl;
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
    onError?.(`Failed to load from ${currentSource.name}`);
  };

  const getDisplayTitle = () => {
    if (type === 'tv' && season && episode) {
      return `${title} - S${season}E${episode}`;
    }
    return title;
  };

  useEffect(() => {
    // Simulate progress tracking
    const interval = setInterval(() => {
      if (!isLoading && !hasError) {
        onProgress?.(Date.now() % 3600, 3600); // Mock progress
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isLoading, hasError, onProgress]);

  return (
    <div className="relative w-full h-full">
      <VideoPlayerState
        isLoading={isLoading}
        hasError={hasError}
        title={getDisplayTitle()}
        currentSourceName={currentSource.name}
        onRetry={reloadPlayer}
        onSwitchSource={switchSource}
      />

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
  );
};
