import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { streamingSources, getStreamingUrl } from '@/services/streaming';
import { watchHistoryService } from '@/services/watchHistory';
import { tmdbApi } from '@/services/tmdb';
import { SkipForward, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';

interface EnhancedVideoPlayerProps {
  title: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  autoFullscreen?: boolean;
  // Additional props for watch history
  poster_path?: string;
  backdrop_path?: string;
  duration?: number; // Duration in seconds
}

export const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  title,
  tmdbId,
  type,
  season,
  episode,
  autoFullscreen = false,
  poster_path,
  backdrop_path,
  duration
}) => {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasStartedWatching, setHasStartedWatching] = useState(false);
  const [estimatedDuration, setEstimatedDuration] = useState(duration);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressUpdateRef = useRef<number>(0);

  const currentUrl = getStreamingUrl(tmdbId, type, currentSourceIndex, season, episode);
  const currentSource = streamingSources[currentSourceIndex];

  // Enhanced URL with better caching and performance parameters
  const enhancedUrl = `${currentUrl}&cache=1&preload=auto&buffer=30&quality=auto&timestamp=${Date.now()}`;

  // Fetch duration information if not provided
  useEffect(() => {
    const fetchDurationInfo = async () => {
      if (!estimatedDuration) {
        try {
          if (type === 'movie') {
            const movieDetails = await tmdbApi.getMovieDetails(tmdbId);
            if (movieDetails.runtime) {
              setEstimatedDuration(movieDetails.runtime * 60); // Convert minutes to seconds
            }
          } else if (type === 'tv' && season && episode) {
            const seasonDetails = await tmdbApi.getTVSeasonDetails(tmdbId, season);
            const episodeInfo = seasonDetails.episodes?.find(ep => ep.episode_number === episode);
            if (episodeInfo?.runtime) {
              setEstimatedDuration(episodeInfo.runtime * 60); // Convert minutes to seconds
            } else {
              // Default TV episode duration
              setEstimatedDuration(45 * 60); // 45 minutes
            }
          }
        } catch (error) {
          console.error('Error fetching duration info:', error);
          // Set default durations
          if (type === 'movie') {
            setEstimatedDuration(120 * 60); // 2 hours
          } else {
            setEstimatedDuration(45 * 60); // 45 minutes
          }
        }
      }
    };

    fetchDurationInfo();
  }, [tmdbId, type, season, episode, estimatedDuration]);

  // Add to watch history when playback starts
  const addToWatchHistory = async () => {
    if (!hasStartedWatching) {
      try {
        let finalPosterPath = poster_path;
        let finalBackdropPath = backdrop_path;

        // Fetch poster and backdrop if not provided
        if (!finalPosterPath || !finalBackdropPath) {
          if (type === 'movie') {
            const movieDetails = await tmdbApi.getMovieDetails(tmdbId);
            finalPosterPath = finalPosterPath || movieDetails.poster_path;
            finalBackdropPath = finalBackdropPath || movieDetails.backdrop_path;
          } else {
            const tvDetails = await tmdbApi.getTVDetails(tmdbId);
            finalPosterPath = finalPosterPath || tvDetails.poster_path;
            finalBackdropPath = finalBackdropPath || tvDetails.backdrop_path;
          }
        }

        watchHistoryService.addToHistory({
          tmdbId,
          type,
          title,
          poster_path: finalPosterPath,
          backdrop_path: finalBackdropPath,
          season,
          episode,
          progress: 0,
          duration: estimatedDuration
        });
        setHasStartedWatching(true);
        console.log('Added to watch history:', title);
      } catch (error) {
        console.error('Error adding to watch history:', error);
      }
    }
  };

  // Update progress in watch history (throttled to avoid too many updates)
  const updateWatchProgress = (progressSeconds: number) => {
    const now = Date.now();
    // Only update every 10 seconds to avoid spam
    if (now - lastProgressUpdateRef.current > 10000) {
      watchHistoryService.updateProgress(
        tmdbId,
        type,
        Math.floor(progressSeconds),
        season,
        episode,
        estimatedDuration
      );
      lastProgressUpdateRef.current = now;
      console.log('Updated watch progress:', Math.floor(progressSeconds), 'seconds');
    }
  };

  // Start progress tracking when video starts playing
  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Add to history when playback starts
    addToWatchHistory();

    // Update progress every 5 seconds while playing
    progressIntervalRef.current = setInterval(() => {
      if (isPlaying) {
        setCurrentTime(prev => {
          const newTime = prev + 5;
          updateWatchProgress(newTime);
          return newTime;
        });
      }
    }, 5000);
  };

  // Stop progress tracking
  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Handle iframe messages (for video events if supported by the streaming source)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = event.data;
        
        if (typeof data === 'object' && data !== null) {
          // Handle different video events from iframe
          switch (data.event) {
            case 'video-play':
              setIsPlaying(true);
              startProgressTracking();
              break;
            case 'video-pause':
              setIsPlaying(false);
              stopProgressTracking();
              break;
            case 'video-timeupdate':
              if (data.currentTime) {
                setCurrentTime(data.currentTime);
                updateWatchProgress(data.currentTime);
              }
              break;
            case 'video-ended':
              setIsPlaying(false);
              stopProgressTracking();
              // Mark as completed
              if (estimatedDuration) {
                updateWatchProgress(estimatedDuration);
              }
              break;
          }
        }
      } catch (error) {
        // Ignore message parsing errors
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      stopProgressTracking();
    };
  }, [tmdbId, type, season, episode, estimatedDuration, isPlaying]);

  // Simulate playback start after iframe loads (fallback if no iframe messages)
  useEffect(() => {
    if (!isLoading && !hasError) {
      // Start tracking after a delay to assume playback started
      const timeout = setTimeout(() => {
        if (!hasStartedWatching) {
          addToWatchHistory();
          setIsPlaying(true);
          startProgressTracking();
        }
      }, 3000); // 3 second delay

      return () => clearTimeout(timeout);
    }
  }, [isLoading, hasError]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopProgressTracking();
      // Save final progress when component unmounts
      if (hasStartedWatching && currentTime > 0) {
        updateWatchProgress(currentTime);
      }
    };
  }, []);

  const switchSource = () => {
    const nextIndex = (currentSourceIndex + 1) % streamingSources.length;
    setCurrentSourceIndex(nextIndex);
    setHasError(false);
    setIsLoading(true);
    
    // Reset playback state
    setIsPlaying(false);
    stopProgressTracking();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.postMessage(
          { action: isMuted ? 'unmute' : 'mute' }, 
          '*'
        );
      } catch (error) {
        console.log('Could not control iframe audio');
      }
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const reloadPlayer = () => {
    setIsLoading(true);
    setHasError(false);
    setIsPlaying(false);
    stopProgressTracking();
    
    if (iframeRef.current) {
      // Force reload with new timestamp to bypass cache
      const reloadUrl = `${currentUrl}&cache=1&preload=auto&buffer=30&quality=auto&timestamp=${Date.now()}`;
      iframeRef.current.src = reloadUrl;
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (autoFullscreen && containerRef.current && !isFullscreen) {
      setTimeout(() => {
        toggleFullscreen();
      }, 1000);
    }
  }, [autoFullscreen]);

  useEffect(() => {
    // Reload iframe when source changes
    if (iframeRef.current) {
      setIsLoading(true);
      setHasError(false);
      setIsPlaying(false);
      stopProgressTracking();
      iframeRef.current.src = enhancedUrl;
    }
  }, [currentSourceIndex]);

  const handleIframeLoad = () => {
    setTimeout(() => {
      setIsLoading(false);
      setHasError(false);
    }, 500); // Small delay to ensure content is actually loaded
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    setIsPlaying(false);
    stopProgressTracking();
  };

  // Add timeout fallback for loading state
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 15000); // 15 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className="relative w-full bg-black rounded-lg overflow-hidden">
      {/* Video Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between bg-black/50 backdrop-blur-sm rounded-lg p-2">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium bg-primary px-2 py-1 rounded">
            {currentSource.name}
          </span>
          <span className="text-white/80 text-xs">
            {type === 'tv' && season && episode ? `S${season}E${episode}` : 'Movie'}
          </span>
          {/* Show playback status */}
          {hasStartedWatching && (
            <span className="text-white/60 text-xs">
              {isPlaying ? '▶️ Playing' : '⏸️ Paused'} • {formatTime(currentTime)}
              {estimatedDuration && ` / ${formatTime(estimatedDuration)}`}
            </span>
          )}
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
            onClick={toggleMute}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          
          <Button
            onClick={toggleFullscreen}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-white">Loading {title}...</p>
            <p className="text-white/60 text-sm">Source: {currentSource.name}</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center max-w-md mx-auto p-6">
            <p className="text-white mb-4">Failed to load from {currentSource.name}</p>
            <div className="flex gap-2 justify-center">
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
        src={enhancedUrl}
        title={title}
        className="w-full aspect-video"
        style={{ minHeight: '400px' }}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        referrerPolicy="no-referrer-when-downgrade"
        loading="eager"
      />

      {/* Source Selector - At Bottom of Frame */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/70 backdrop-blur-sm p-2">
        <div className="flex gap-2 overflow-x-auto">
          {streamingSources.map((source, index) => (
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

      {/* Progress indicator (if duration is available) */}
      {estimatedDuration && hasStartedWatching && (
        <div className="absolute bottom-12 left-2 right-2 z-10">
          <div className="bg-black/50 rounded-full h-1">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((currentTime / estimatedDuration) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
