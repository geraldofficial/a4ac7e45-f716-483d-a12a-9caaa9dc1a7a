
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCw, 
  Settings, SkipBack, SkipForward, Rewind, FastForward,
  PictureInPicture, Download, Share2, MoreHorizontal, X,
  Cast, Subtitles, RefreshCw, Loader2, Lock, Unlock
} from 'lucide-react';
import { streamingSources, getStreamingUrl } from '@/services/streaming';
import { watchHistoryService } from '@/services/watchHistory';
import { ProductionLoadingSpinner } from './ProductionLoadingSpinner';

interface FullFeaturedVideoPlayerProps {
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

export const FullFeaturedVideoPlayer: React.FC<FullFeaturedVideoPlayerProps> = ({
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
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isLocked, setIsLocked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [hasStartedWatching, setHasStartedWatching] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const lastTapRef = useRef<number>(0);
  const gestureStartRef = useRef<{ x: number; y: number } | null>(null);

  const currentUrl = getStreamingUrl(tmdbId, type, currentSourceIndex, season, episode);
  const currentSource = streamingSources[currentSourceIndex];

  // Orientation detection
  useEffect(() => {
    const handleOrientationChange = () => {
      if (window.screen && window.screen.orientation) {
        const angle = window.screen.orientation.angle;
        setOrientation(angle === 90 || angle === -90 ? 'landscape' : 'portrait');
      } else {
        // Fallback for older browsers
        setOrientation(window.innerHeight < window.innerWidth ? 'landscape' : 'portrait');
      }
    };

    handleOrientationChange();
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && !isLocked) {
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
  }, [showControls, isLocked]);

  // Add to watch history
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

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
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

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const forceRotation = () => {
    if ('screen' in window && 'orientation' in window.screen) {
      try {
        if (orientation === 'portrait') {
          (window.screen.orientation as any).lock('landscape');
        } else {
          (window.screen.orientation as any).lock('portrait');
        }
      } catch (error) {
        console.error('Rotation lock error:', error);
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isLocked) return;
    
    const touch = e.touches[0];
    gestureStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isLocked) return;

    const now = Date.now();
    const timeDiff = now - lastTapRef.current;
    
    // Double tap to toggle fullscreen
    if (timeDiff < 300) {
      toggleFullscreen();
    } else {
      setShowControls(!showControls);
    }
    
    lastTapRef.current = now;
    gestureStartRef.current = null;
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

  const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div 
      ref={containerRef} 
      className={`fixed inset-0 z-50 bg-black flex flex-col ${
        orientation === 'landscape' ? 'landscape-mode' : 'portrait-mode'
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ filter: `brightness(${brightness}%)` }}
    >
      {/* Top Controls Bar */}
      <div className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4 transition-all duration-300 ${
        showControls || isLocked ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-white text-lg font-semibold truncate max-w-xs">{getDisplayTitle()}</h1>
            <span className="text-white/60 text-sm bg-primary px-2 py-1 rounded">
              {currentSource.name}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsLocked(!isLocked)}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              title={isLocked ? "Unlock controls" : "Lock controls"}
            >
              {isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </Button>
            
            <Button
              onClick={forceRotation}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 md:hidden"
              title="Rotate screen"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={() => setShowSettings(!showSettings)}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            {onClose && (
              <Button
                onClick={onClose}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                title="Close player"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 z-30 bg-black/90 backdrop-blur-sm rounded-lg p-4 min-w-64">
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm mb-2 block">Playback Speed</label>
              <Select value={playbackSpeed.toString()} onValueChange={(value) => setPlaybackSpeed(parseFloat(value))}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {playbackSpeeds.map(speed => (
                    <SelectItem key={speed} value={speed.toString()}>
                      {speed}x
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-white text-sm mb-2 block">Brightness</label>
              <Slider
                value={[brightness]}
                onValueChange={(value) => setBrightness(value[0])}
                max={150}
                min={50}
                step={10}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-white text-sm mb-2 block">Quality</label>
              <Button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Auto
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Video Container */}
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
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Video Iframe */}
        <iframe
          ref={iframeRef}
          src={`${currentUrl}&t=${resumeFrom}&autoplay=1&speed=${playbackSpeed}`}
          title={getDisplayTitle()}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Gesture Overlay for Mobile */}
        <div className="absolute inset-0 md:hidden" />
      </div>

      {/* Bottom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent transition-all duration-300 ${
        showControls || isLocked ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
      }`}>
        {/* Progress Bar - Mobile friendly */}
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 text-white text-xs">
            <span>00:00</span>
            <div className="flex-1 bg-white/20 rounded-full h-1">
              <div className="bg-primary h-1 rounded-full w-1/3"></div>
            </div>
            <span>{duration ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` : '--:--'}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-2">
              <Button
                onClick={reloadPlayer}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                title="Reload"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={switchSource}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                title="Switch source"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Center Controls */}
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                title="Rewind 10s"
              >
                <Rewind className="h-5 w-5" />
              </Button>
              
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/20 w-12 h-12 rounded-full"
                title="Play/Pause"
              >
                <Play className="h-6 w-6" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                title="Forward 10s"
              >
                <FastForward className="h-5 w-5" />
              </Button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleFullscreen}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 hidden md:flex"
                title="Picture in Picture"
              >
                <PictureInPicture className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Source Selector - Collapsible on mobile */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto">
            {streamingSources.slice(0, 6).map((source, index) => (
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

      {/* Lock indicator */}
      {isLocked && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 rounded-full p-3">
          <Lock className="h-6 w-6 text-white" />
        </div>
      )}
    </div>
  );
};
