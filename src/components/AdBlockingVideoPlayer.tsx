import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCw, 
  Settings, SkipBack, SkipForward, X, ArrowLeft, Monitor, Smartphone, AlertTriangle
} from 'lucide-react';
import { streamingSources, getStreamingUrl } from '@/services/streaming';
import { watchHistoryService } from '@/services/watchHistory';
import { ProductionLoadingSpinner } from './ProductionLoadingSpinner';
import { useToast } from '@/hooks/use-toast';

interface AdBlockingVideoPlayerProps {
  title: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  poster_path?: string;
  backdrop_path?: string;
  resumeFrom?: number;
  onClose?: () => void;
}

export const AdBlockingVideoPlayer: React.FC<AdBlockingVideoPlayerProps> = ({
  title,
  tmdbId,
  type,
  season,
  episode,
  poster_path,
  backdrop_path,
  resumeFrom = 0,
  onClose
}) => {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const loadTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const currentSource = streamingSources[currentSourceIndex];
  const videoUrl = getStreamingUrl(tmdbId, type, currentSourceIndex, season, episode);

  // Detect mobile device and online status
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-hide controls on mobile
  useEffect(() => {
    if (isMobile && showControls) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isMobile]);

  // Add to watch history
  useEffect(() => {
    try {
      watchHistoryService.addToHistory({
        tmdbId,
        type,
        title,
        poster_path,
        backdrop_path,
        season,
        episode,
        progress: resumeFrom,
        lastSource: currentSource.name
      });
    } catch (error) {
      console.error('Failed to add to watch history:', error);
    }
  }, [tmdbId, type, title, poster_path, backdrop_path, season, episode, resumeFrom, currentSource.name]);

  const handleMobileInteraction = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isMobile) return;
    
    const now = Date.now();
    const timeDiff = now - lastTap;
    
    if (timeDiff < 300) {
      // Double tap - toggle fullscreen
      toggleFullscreen();
    } else {
      // Single tap - toggle controls
      setShowControls(prev => !prev);
    }
    
    setLastTap(now);
  }, [isMobile, lastTap]);

  const switchSource = useCallback(() => {
    if (streamingSources.length <= 1) return;
    
    const nextIndex = (currentSourceIndex + 1) % streamingSources.length;
    setCurrentSourceIndex(nextIndex);
    setHasError(false);
    setIsLoading(true);
    setErrorMessage('');
    setRetryCount(0);
    
    toast({
      title: "Switching source",
      description: `Now using ${streamingSources[nextIndex].name}`,
    });
  }, [currentSourceIndex, toast]);

  const reloadPlayer = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');
    setRetryCount(prev => prev + 1);
    
    if (iframeRef.current) {
      const newUrl = `${videoUrl}&t=${resumeFrom}&reload=${Date.now()}&retry=${retryCount}`;
      iframeRef.current.src = newUrl;
    }
    
    // Set a timeout for loading
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    
    loadTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setHasError(true);
        setErrorMessage('Source took too long to load');
      }
    }, 15000); // 15 second timeout
  }, [videoUrl, resumeFrom, retryCount, isLoading]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      toast({
        title: "Fullscreen error",
        description: "Unable to toggle fullscreen mode",
        variant: "destructive"
      });
    }
  }, [isFullscreen, toast]);

  const handleIframeLoad = useCallback(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    
    setTimeout(() => {
      setIsLoading(false);
      setHasError(false);
      setErrorMessage('');
    }, 2000);
  }, []);

  const handleIframeError = useCallback(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    
    setIsLoading(false);
    setHasError(true);
    setErrorMessage(`Failed to load from ${currentSource.name}`);
    
    // Auto-switch to next source after 3 failed attempts
    if (retryCount >= 2 && streamingSources.length > 1) {
      setTimeout(() => {
        switchSource();
      }, 1000);
    }
  }, [currentSource.name, retryCount, switchSource]);

  const getDisplayTitle = useCallback(() => {
    if (type === 'tv' && season && episode) {
      return `${title} - S${season}E${episode}`;
    }
    return title;
  }, [title, type, season, episode]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  // Handle online/offline status
  if (!isOnline) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-4">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-4">No Internet Connection</h2>
          <p className="text-white/70 mb-6">
            Please check your internet connection and try again.
          </p>
          <Button onClick={() => window.location.reload()} variant="default">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black"
      onClick={handleMobileInteraction}
    >
      {/* Top Controls */}
      <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent transition-all duration-300 z-20 ${
        showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
      }`}>
        <div className="flex items-center justify-between p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            {onClose && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 rounded-full p-2 md:p-3"
              >
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            )}
            <h1 className="text-white text-sm md:text-lg font-semibold truncate">
              {getDisplayTitle()}
            </h1>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <span className={`text-white/80 text-xs md:text-sm px-2 md:px-3 py-1 rounded-full font-medium ${
              currentSource.reliability === 'high' ? 'bg-green-600' :
              currentSource.reliability === 'medium' ? 'bg-yellow-600' :
              'bg-red-600'
            }`}>
              {currentSource.name}
            </span>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                reloadPlayer();
              }}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full p-2 md:p-3"
              disabled={isLoading}
            >
              <RotateCw className={`h-3 w-3 md:h-4 md:w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
              }}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full p-2 md:p-3"
            >
              <Settings className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>
      </div>

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
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10 p-4">
          <div className="text-center max-w-md mx-auto">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-white mb-2 text-lg md:text-xl font-semibold">Playback Error</p>
            <p className="text-white/70 mb-6 text-sm md:text-base">
              {errorMessage || `Failed to load from ${currentSource.name}`}
            </p>
            {retryCount >= 2 && (
              <p className="text-yellow-400 text-xs mb-4">
                Multiple retry attempts failed. Try switching to a different source.
              </p>
            )}
            <div className="flex flex-col md:flex-row gap-3 justify-center">
              {streamingSources.length > 1 && (
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    switchSource();
                  }}
                  variant="default"
                  className="w-full md:w-auto"
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Try Next Source
                </Button>
              )}
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  reloadPlayer();
                }}
                variant="outline"
                className="w-full md:w-auto"
                disabled={retryCount >= 5}
              >
                <RotateCw className="h-4 w-4 mr-2" />
                {retryCount >= 5 ? 'Max Retries' : 'Retry'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Container */}
      <div className="relative w-full h-full">
        <iframe
          ref={iframeRef}
          src={`${videoUrl}&t=${resumeFrom}&autoplay=1`}
          title={getDisplayTitle()}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          style={{
            border: 'none',
            background: 'black'
          }}
        />
      </div>

      {/* Bottom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent transition-all duration-300 z-20 ${
        showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
      }`}>
        <div className="p-3 md:p-4">
          {/* Mobile Controls */}
          {isMobile ? (
            <div className="flex items-center justify-center gap-6">
              {streamingSources.length > 1 && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    switchSource();
                  }}
                  size="lg"
                  variant="ghost"
                  className="text-white hover:bg-white/20 rounded-full p-4"
                >
                  <SkipForward className="h-6 w-6" />
                </Button>
              )}
              
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/20 rounded-full p-4"
              >
                {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
              </Button>
              
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(!showSettings);
                }}
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/20 rounded-full p-4"
              >
                <Settings className="h-6 w-6" />
              </Button>
            </div>
          ) : (
            /* Desktop Controls */
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {streamingSources.length > 1 && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      switchSource();
                    }}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 rounded-full"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                )}
                
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                  size="lg"
                  variant="ghost"
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {isMobile ? (
                  <Smartphone className="h-4 w-4 text-white/60" />
                ) : (
                  <Monitor className="h-4 w-4 text-white/60" />
                )}
                {!isOnline && (
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-12 md:top-16 right-2 md:right-4 bg-black/95 backdrop-blur-sm rounded-xl p-3 md:p-4 min-w-48 md:min-w-64 z-30 max-h-80 overflow-y-auto border border-gray-700">
          <h3 className="text-white font-semibold mb-3 text-sm md:text-base">Video Sources</h3>
          <div className="space-y-2">
            {streamingSources.map((source, index) => (
              <Button
                key={source.name}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSourceIndex(index);
                  setShowSettings(false);
                  setIsLoading(true);
                  setHasError(false);
                  setErrorMessage('');
                  setRetryCount(0);
                }}
                variant={index === currentSourceIndex ? "default" : "outline"}
                size="sm"
                className="w-full text-left justify-start text-xs md:text-sm"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="truncate">{source.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ml-2 flex-shrink-0 ${
                    source.reliability === 'high' ? 'bg-green-500/20 text-green-400' :
                    source.reliability === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {source.reliability}
                  </span>
                </div>
              </Button>
            ))}
          </div>
          <div className="mt-4 p-2 md:p-3 bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-400">
              {isMobile ? 'Tap to toggle controls. Double-tap for fullscreen.' : 'Sources are optimized for quality and speed. Switch if experiencing issues.'}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-xs text-gray-400">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Instructions Overlay */}
      {isMobile && showControls && !hasError && !isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white/60 text-sm pointer-events-none">
          <p>Tap to toggle controls</p>
          <p>Double-tap for fullscreen</p>
        </div>
      )}
    </div>
  );
};
