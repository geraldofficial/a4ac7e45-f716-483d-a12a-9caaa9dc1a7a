
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
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
        if (isPlaying) setShowControls(false);
      }, 4000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying, isMobile]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0];
    video.volume = newVolume / 100;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = value[0];
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.min(video.duration, video.currentTime + 10);
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, video.currentTime - 10);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
      onClick={() => isMobile && setShowControls(!showControls)}
    >
      {/* Top Controls */}
      <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent transition-opacity duration-300 z-20 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {onClose && (
              <Button
                onClick={onClose}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-white text-lg font-semibold truncate max-w-64">{getDisplayTitle()}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm bg-red-600 px-3 py-1 rounded-full font-medium">
              {currentSource.name}
            </span>
            <Button
              onClick={reloadPlayer}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setShowSettings(!showSettings)}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full"
            >
              <Settings className="h-4 w-4" />
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
                <RotateCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Container */}
      <div className="relative w-full h-full">
        {/* Use iframe for streaming sources with ad blocking */}
        <iframe
          ref={iframeRef}
          src={`${videoUrl}&t=${resumeFrom}`}
          title={getDisplayTitle()}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-top-navigation-by-user-activation"
          style={{
            border: 'none',
            background: 'black'
          }}
        />
      </div>

      {/* Bottom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 z-20 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={skipBackward}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={toggleFullscreen}
              size="lg"
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full"
            >
              {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
            </Button>
            
            <Button
              onClick={skipForward}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full"
            >
              <SkipForward className="h-5 w-5" />
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
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-black/95 backdrop-blur-sm rounded-xl p-4 min-w-64 z-30">
          <h3 className="text-white font-semibold mb-3">Video Sources</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {streamingSources.map((source, index) => (
              <Button
                key={source.name}
                onClick={() => {
                  setCurrentSourceIndex(index);
                  setShowSettings(false);
                  setIsLoading(true);
                  setHasError(false);
                }}
                variant={index === currentSourceIndex ? "default" : "outline"}
                size="sm"
                className="w-full text-left justify-start"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{source.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
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
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-400">
              Sources are automatically filtered for ad blocking. Switch sources if playback fails.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
