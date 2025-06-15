
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCw, 
  Settings, SkipBack, SkipForward, X, ArrowLeft, Monitor, Smartphone
} from 'lucide-react';
import { streamingSources, getStreamingUrl } from '@/services/streaming';
import { watchHistoryService } from '@/services/watchHistory';
import { ProductionLoadingSpinner } from './ProductionLoadingSpinner';

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
  const [isMobile, setIsMobile] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const currentSource = streamingSources[currentSourceIndex];
  const videoUrl = getStreamingUrl(tmdbId, type, currentSourceIndex, season, episode);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Add to watch history
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

    // Auto-hide controls on mobile
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

  const handleMobileInteraction = () => {
    if (!isMobile) return;
    
    const now = Date.now();
    const timeDiff = now - lastTap;
    
    if (timeDiff < 300) {
      // Double tap - toggle fullscreen
      toggleFullscreen();
    } else {
      // Single tap - toggle controls
      setShowControls(!showControls);
    }
    
    setLastTap(now);
  };

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
      iframeRef.current.src = `${videoUrl}&t=${resumeFrom}&reload=${Date.now()}`;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

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
            <span className="text-white/80 text-xs md:text-sm bg-red-600 px-2 md:px-3 py-1 rounded-full font-medium">
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
            >
              <RotateCw className="h-3 w-3 md:h-4 md:w-4" />
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
            <p className="text-white mb-4 text-lg md:text-xl">Playback Error</p>
            <p className="text-white/70 mb-6 text-sm md:text-base">
              Failed to load from {currentSource.name}
            </p>
            <div className="flex flex-col md:flex-row gap-3 justify-center">
              <Button 
                onClick={switchSource} 
                variant="default"
                className="w-full md:w-auto"
              >
                <SkipForward className="h-4 w-4 mr-2" />
                Try Next Source
              </Button>
              <Button 
                onClick={reloadPlayer} 
                variant="outline"
                className="w-full md:w-auto"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Container */}
      <div className="relative w-full h-full">
        <iframe
          ref={iframeRef}
          src={`${videoUrl}&t=${resumeFrom}`}
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
                <Button
                  onClick={switchSource}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
                
                <Button
                  onClick={toggleFullscreen}
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
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-12 md:top-16 right-2 md:right-4 bg-black/95 backdrop-blur-sm rounded-xl p-3 md:p-4 min-w-48 md:min-w-64 z-30 max-h-80 overflow-y-auto">
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
              {isMobile ? 'Tap to toggle controls. Double-tap for fullscreen.' : 'Sources are filtered for optimal playback. Switch if needed.'}
            </p>
          </div>
        </div>
      )}

      {/* Mobile Instructions Overlay */}
      {isMobile && showControls && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white/60 text-sm pointer-events-none">
          <p>Tap to toggle controls</p>
          <p>Double-tap for fullscreen</p>
        </div>
      )}
    </div>
  );
};
