
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { streamingSources, getStreamingUrl } from '@/services/streaming';
import { watchHistoryService } from '@/services/watchHistory';
import { tmdbApi } from '@/services/tmdb';
import { SkipForward, Volume2, VolumeX, Maximize, RotateCcw, Info } from 'lucide-react';

interface EnhancedVideoPlayerProps {
  title: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  autoFullscreen?: boolean;
  poster_path?: string;
  backdrop_path?: string;
  duration?: number;
  resumeFrom?: number;
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
  duration,
  resumeFrom = 0
}) => {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(resumeFrom);
  const [hasStartedWatching, setHasStartedWatching] = useState(false);
  const [estimatedDuration, setEstimatedDuration] = useState(duration);
  const [hasResumed, setHasResumed] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [sourceErrors, setSourceErrors] = useState<number[]>([]);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressUpdateRef = useRef<number>(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentUrl = getStreamingUrl(tmdbId, type, currentSourceIndex, season, episode);
  const currentSource = streamingSources[currentSourceIndex];

  // Enhanced URL with proper parameters for better playback
  const enhancedUrl = `${currentUrl}&t=${resumeFrom}&timestamp=${Date.now()}`;

  // Auto-hide controls after 3 seconds of no interaction
  useEffect(() => {
    if (showControls) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  // Show controls on mouse move
  const handleMouseMove = () => {
    setShowControls(true);
  };

  // Check for existing watch history and resume information
  useEffect(() => {
    const resumeInfo = watchHistoryService.getResumeInfo(tmdbId, type, season, episode);
    if (resumeInfo.shouldResume && !hasResumed && resumeFrom === 0) {
      setCurrentTime(resumeInfo.progress);
      // Try to set the source to the last used one
      if (resumeInfo.source) {
        const sourceIndex = streamingSources.findIndex(s => s.name === resumeInfo.source);
        if (sourceIndex >= 0 && !sourceErrors.includes(sourceIndex)) {
          setCurrentSourceIndex(sourceIndex);
        }
      }
      setHasResumed(true);
    }
  }, [tmdbId, type, season, episode, resumeFrom, hasResumed, sourceErrors]);

  // Fetch duration information if not provided
  useEffect(() => {
    const fetchDurationInfo = async () => {
      if (!estimatedDuration) {
        try {
          if (type === 'movie') {
            const movieDetails = await tmdbApi.getMovieDetails(tmdbId);
            if (movieDetails.runtime) {
              setEstimatedDuration(movieDetails.runtime * 60);
            } else {
              setEstimatedDuration(120 * 60); // Default 2 hours for movies
            }
          } else if (type === 'tv') {
            // For TV shows, try to get episode runtime
            if (season && episode) {
              try {
                const seasonDetails = await tmdbApi.getTVSeasonDetails(tmdbId, season);
                const episodeInfo = seasonDetails.episodes?.find(ep => ep.episode_number === episode);
                if (episodeInfo?.runtime) {
                  setEstimatedDuration(episodeInfo.runtime * 60);
                } else {
                  setEstimatedDuration(45 * 60); // Default 45 minutes for TV episodes
                }
              } catch {
                setEstimatedDuration(45 * 60);
              }
            } else {
              setEstimatedDuration(45 * 60);
            }
          }
        } catch (error) {
          console.error('Error fetching duration info:', error);
          setEstimatedDuration(type === 'movie' ? 120 * 60 : 45 * 60);
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
          progress: Math.max(currentTime, resumeFrom),
          duration: estimatedDuration,
          lastSource: currentSource.name
        });
        setHasStartedWatching(true);
        console.log('Added to watch history:', title, 'Resume from:', Math.max(currentTime, resumeFrom));
      } catch (error) {
        console.error('Error adding to watch history:', error);
      }
    }
  };

  // Update progress in watch history
  const updateWatchProgress = (progressSeconds: number) => {
    const now = Date.now();
    if (now - lastProgressUpdateRef.current > 30000) {
      watchHistoryService.updateProgress(
        tmdbId,
        type,
        Math.floor(progressSeconds),
        season,
        episode,
        estimatedDuration,
        currentSource.name
      );
      lastProgressUpdateRef.current = now;
      console.log('Updated watch progress:', Math.floor(progressSeconds), 'seconds via', currentSource.name);
    }
  };

  // Start progress tracking
  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    addToWatchHistory();

    progressIntervalRef.current = setInterval(() => {
      if (isPlaying) {
        setCurrentTime(prev => {
          const newTime = prev + 10;
          updateWatchProgress(newTime);
          return newTime;
        });
      }
    }, 10000);
  };

  // Stop progress tracking
  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Handle iframe messages for video events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = event.data;
        
        if (typeof data === 'object' && data !== null) {
          switch (data.event) {
            case 'video-play':
              setIsPlaying(true);
              startProgressTracking();
              break;
            case 'video-pause':
              setIsPlaying(false);
              stopProgressTracking();
              if (hasStartedWatching && currentTime > 0) {
                updateWatchProgress(currentTime);
              }
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
  }, [tmdbId, type, season, episode, estimatedDuration, isPlaying, hasStartedWatching, currentTime]);

  // Simulate playback start after iframe loads
  useEffect(() => {
    if (!isLoading && !hasError) {
      const timeout = setTimeout(() => {
        if (!hasStartedWatching) {
          addToWatchHistory();
          setIsPlaying(true);
          startProgressTracking();
        }
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [isLoading, hasError]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopProgressTracking();
      if (hasStartedWatching && currentTime > 0) {
        updateWatchProgress(currentTime);
      }
    };
  }, []);

  // Switch to next available source
  const switchSource = () => {
    const nextIndex = (currentSourceIndex + 1) % streamingSources.length;
    setCurrentSourceIndex(nextIndex);
    setHasError(false);
    setIsLoading(true);
    setIsPlaying(false);
    stopProgressTracking();
    
    // Mark current source as having an error
    setSourceErrors(prev => [...prev, currentSourceIndex]);
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
      const reloadUrl = `${getStreamingUrl(tmdbId, type, currentSourceIndex, season, episode)}&t=${Math.floor(currentTime)}&timestamp=${Date.now()}`;
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
    if (iframeRef.current) {
      setIsLoading(true);
      setHasError(false);
      setIsPlaying(false);
      stopProgressTracking();
      const urlWithResume = `${getStreamingUrl(tmdbId, type, currentSourceIndex, season, episode)}&t=${Math.floor(currentTime)}&timestamp=${Date.now()}`;
      iframeRef.current.src = urlWithResume;
    }
  }, [currentSourceIndex]);

  const handleIframeLoad = () => {
    setTimeout(() => {
      setIsLoading(false);
      setHasError(false);
    }, 1000);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    setIsPlaying(false);
    stopProgressTracking();
    setSourceErrors(prev => [...prev, currentSourceIndex]);
  };

  // Add timeout fallback for loading state
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 20000);

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

  // Get content type display text
  const getContentTypeText = () => {
    if (type === 'movie') return 'Movie';
    if (type === 'tv' && season && episode) return `S${season}E${episode}`;
    return 'TV Show';
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full bg-black rounded-lg overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Controls Overlay */}
      <div className={`absolute top-4 left-4 right-4 z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between bg-black/70 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center gap-3">
            <span className="text-white text-sm font-medium bg-primary px-3 py-1 rounded-full">
              {currentSource.name}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-white/80 text-sm">{getContentTypeText()}</span>
              {sourceErrors.includes(currentSourceIndex) && (
                <span className="text-red-400 text-xs">⚠️ Source Issue</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={reloadPlayer}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={toggleMute}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            
            <Button
              onClick={toggleFullscreen}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Info overlay for series/movies */}
      {hasStartedWatching && (
        <div className={`absolute top-20 left-4 z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 text-white text-sm">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>
                {isPlaying ? '▶️ Playing' : '⏸️ Paused'} • {formatTime(currentTime)}
                {estimatedDuration && ` / ${formatTime(estimatedDuration)}`}
              </span>
            </div>
            {resumeFrom > 0 && (
              <div className="text-green-400 text-xs mt-1">
                Resumed from {formatTime(resumeFrom)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-white text-lg mb-2">Loading {title}...</p>
            <p className="text-white/60 text-sm">Source: {currentSource.name}</p>
            <p className="text-white/60 text-sm">{getContentTypeText()}</p>
            {resumeFrom > 0 && (
              <p className="text-green-400 text-sm mt-2">Resuming from {formatTime(resumeFrom)}</p>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center max-w-md mx-auto p-6">
            <p className="text-white mb-2 text-lg">Playback Error</p>
            <p className="text-white/70 mb-4">Failed to load from {currentSource.name}</p>
            <p className="text-white/60 text-sm mb-6">
              {type === 'movie' ? 'Movie' : `TV Show S${season}E${episode}`}
            </p>
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
        src={enhancedUrl}
        title={`${title} ${getContentTypeText()}`}
        className="w-full aspect-video"
        style={{ minHeight: '400px' }}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        referrerPolicy="no-referrer-when-downgrade"
        loading="eager"
      />

      {/* Source Selector */}
      <div className={`absolute bottom-0 left-0 right-0 z-10 bg-black/70 backdrop-blur-sm p-3 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
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
              } ${sourceErrors.includes(index) ? 'border-red-500/50 text-red-300' : ''}`}
            >
              {source.name}
              {sourceErrors.includes(index) && ' ⚠️'}
            </Button>
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      {estimatedDuration && hasStartedWatching && (
        <div className="absolute bottom-16 left-3 right-3 z-10">
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
