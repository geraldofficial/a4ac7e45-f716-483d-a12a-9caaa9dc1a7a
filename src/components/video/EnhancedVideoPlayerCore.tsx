
import React, { useState, useEffect, useRef } from 'react';
import { streamingSources, getStreamingUrl } from '@/services/streaming';
import { VideoPlayerState } from './VideoPlayerState';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useChromecast } from '@/hooks/useChromecast';
import { useSubtitles } from '@/hooks/useSubtitles';

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

export const EnhancedVideoPlayerCore: React.FC<EnhancedVideoPlayerCoreProps> = ({
  title,
  tmdbId,
  type,
  season,
  episode,
  resumeFrom = 0,
  onProgress,
  onError,
  onSourceChange,
  onCastToggle
}) => {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentUrl = getStreamingUrl(tmdbId, type, currentSourceIndex, season, episode);
  const currentSource = streamingSources[currentSourceIndex];

  // Chromecast integration
  const { isCastAvailable, isCasting, startCasting, stopCasting } = useChromecast();

  // Mock subtitles for demonstration - in real implementation, these would come from the streaming source
  const mockSubtitles = [
    {
      id: 'en',
      language: 'en',
      label: 'English',
      url: '/subtitles/en.vtt'
    },
    {
      id: 'es',
      language: 'es', 
      label: 'Spanish',
      url: '/subtitles/es.vtt'
    }
  ];

  // Subtitles integration
  const { 
    currentSubtitle, 
    setCurrentSubtitle, 
    currentCue, 
    updateCurrentCue 
  } = useSubtitles(mockSubtitles);

  // Keyboard shortcuts integration
  useKeyboardShortcuts({
    onPlayPause: () => {
      setIsPlaying(!isPlaying);
      // In real implementation, this would control the iframe video
    },
    onSeekForward: () => {
      const newTime = Math.min(duration, currentTime + 10);
      setCurrentTime(newTime);
    },
    onSeekBackward: () => {
      const newTime = Math.max(0, currentTime - 10);
      setCurrentTime(newTime);
    },
    onVolumeUp: () => {
      const newVolume = Math.min(100, volume + 10);
      setVolume(newVolume);
    },
    onVolumeDown: () => {
      const newVolume = Math.max(0, volume - 10);
      setVolume(newVolume);
    },
    onMute: () => {
      setIsMuted(!isMuted);
    },
    onFullscreen: () => {
      if (iframeRef.current) {
        iframeRef.current.requestFullscreen();
      }
    }
  }, true);

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

  const handleCastToggle = async () => {
    if (isCasting) {
      await stopCasting();
      onCastToggle?.(false);
    } else if (isCastAvailable) {
      const castMedia = {
        title: getDisplayTitle(),
        videoUrl: currentUrl,
        contentType: 'video/mp4',
        imageUrl: `https://image.tmdb.org/t/p/w500/poster.jpg` // Would use actual poster
      };
      await startCasting(castMedia);
      onCastToggle?.(true);
    }
  };

  const getDisplayTitle = () => {
    if (type === 'tv' && season && episode) {
      return `${title} - S${season}E${episode}`;
    }
    return title;
  };

  useEffect(() => {
    // Simulate progress tracking and subtitle updates
    const interval = setInterval(() => {
      if (!isLoading && !hasError && isPlaying) {
        const newTime = currentTime + 1;
        setCurrentTime(newTime);
        updateCurrentCue(newTime);
        onProgress?.(newTime, duration || 3600);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, hasError, isPlaying, currentTime, duration, onProgress, updateCurrentCue]);

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

      {/* Subtitles Display */}
      {currentCue && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded text-center max-w-lg">
          {currentCue.text}
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

      {/* Enhanced Controls Overlay */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 opacity-0 hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">
              {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')} / 
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Subtitle selector */}
            <select 
              value={currentSubtitle} 
              onChange={(e) => setCurrentSubtitle(e.target.value)}
              className="bg-white/20 text-white text-xs px-2 py-1 rounded"
            >
              <option value="off">No Subtitles</option>
              {mockSubtitles.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.label}</option>
              ))}
            </select>

            {/* Cast button */}
            {isCastAvailable && (
              <button
                onClick={handleCastToggle}
                className={`text-white text-xs px-2 py-1 rounded ${
                  isCasting ? 'bg-primary' : 'bg-white/20'
                }`}
              >
                {isCasting ? 'Casting' : 'Cast'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
