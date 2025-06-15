
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCw, 
  Settings, SkipBack, SkipForward, Rewind, FastForward,
  PictureInPicture, Download, Share2, MoreHorizontal, X,
  Cast, Subtitles, RefreshCw, Loader2, Lock, Unlock, Keyboard
} from 'lucide-react';
import { useVideoGestures } from '@/hooks/useVideoGestures';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSubtitles } from '@/hooks/useSubtitles';
import { useChromecast } from '@/hooks/useChromecast';
import { useVideoAnalytics } from '@/hooks/useVideoAnalytics';

interface VideoSource {
  url: string;
  quality: string;
  bandwidth?: number;
}

interface Chapter {
  id: string;
  title: string;
  startTime: number;
  thumbnailUrl?: string;
}

interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
  url: string;
  default?: boolean;
}

interface EnhancedVideoPlayerV2Props {
  title: string;
  videoId: string;
  sources: VideoSource[];
  subtitles?: SubtitleTrack[];
  chapters?: Chapter[];
  poster?: string;
  autoPlay?: boolean;
  onProgress?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  onClose?: () => void;
}

export const EnhancedVideoPlayerV2: React.FC<EnhancedVideoPlayerV2Props> = ({
  title,
  videoId,
  sources,
  subtitles = [],
  chapters = [],
  poster,
  autoPlay = false,
  onProgress,
  onComplete,
  onClose
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [isLocked, setIsLocked] = useState(false);
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
  // Hooks
  const { trackEvent, updateWatchTime, getAnalyticsData, sendAnalytics } = useVideoAnalytics(videoId, title);
  const { currentSubtitle, setCurrentSubtitle, currentCue, updateCurrentCue, availableSubtitles } = useSubtitles(subtitles);
  const { isCastAvailable, isCasting, startCasting, stopCasting } = useChromecast();

  // Gesture handlers
  const gestureHandlers = useVideoGestures({
    onDoubleTap: () => {
      if (!isLocked) toggleFullscreen();
    },
    onSwipeUp: () => {
      if (!isLocked) setShowControls(true);
    },
    onSwipeDown: () => {
      if (!isLocked) setShowControls(false);
    },
    onSwipeLeft: () => {
      if (!isLocked) seekBackward();
    },
    onSwipeRight: () => {
      if (!isLocked) seekForward();
    },
    onVolumeSwipe: (direction, percentage) => {
      if (!isLocked) {
        const newVolume = direction === 'up' 
          ? Math.min(100, volume + percentage * 100)
          : Math.max(0, volume - percentage * 100);
        setVolume(newVolume);
        if (videoRef.current) {
          videoRef.current.volume = newVolume / 100;
        }
      }
    },
    onBrightnessSwipe: (direction, percentage) => {
      if (!isLocked) {
        const newBrightness = direction === 'up'
          ? Math.min(150, brightness + percentage * 100)
          : Math.max(50, brightness - percentage * 100);
        setBrightness(newBrightness);
      }
    }
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onPlayPause: togglePlayPause,
    onSeekForward: seekForward,
    onSeekBackward: seekBackward,
    onVolumeUp: () => setVolume(prev => Math.min(100, prev + 10)),
    onVolumeDown: () => setVolume(prev => Math.max(0, prev - 10)),
    onMute: toggleMute,
    onFullscreen: toggleFullscreen
  }, isFullscreen && !isLocked);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls && isPlaying && !isLocked) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls, isPlaying, isLocked]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);
      updateWatchTime(time);
      updateCurrentCue(time);
      onProgress?.(time, video.duration);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      trackEvent({ type: 'play', currentTime: 0, duration: video.duration });
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
      trackEvent({ type: 'play', currentTime: video.currentTime });
    };

    const handlePause = () => {
      setIsPlaying(false);
      trackEvent({ type: 'pause', currentTime: video.currentTime });
    };

    const handleWaiting = () => {
      setIsBuffering(true);
      trackEvent({ type: 'buffer', currentTime: video.currentTime });
    };

    const handleCanPlay = () => setIsBuffering(false);

    const handleEnded = () => {
      setIsPlaying(false);
      trackEvent({ type: 'complete', currentTime: video.currentTime, duration: video.duration });
      sendAnalytics(getAnalyticsData(video.duration));
      onComplete?.();
    };

    const handleError = () => {
      trackEvent({ type: 'error', error: 'Video playback error' });
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [updateWatchTime, updateCurrentCue, onProgress, onComplete, trackEvent, sendAnalytics, getAnalyticsData]);

  // Player controls
  function togglePlayPause() {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  }

  function seekForward() {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.min(video.duration, video.currentTime + 10);
    trackEvent({ type: 'seek', currentTime: video.currentTime });
  }

  function seekBackward() {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, video.currentTime - 10);
    trackEvent({ type: 'seek', currentTime: video.currentTime });
  }

  function toggleFullscreen() {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  function handleQualityChange(quality: string) {
    setCurrentQuality(quality);
    trackEvent({ type: 'quality_change', quality, currentTime });
    
    // Adaptive streaming logic would go here
    // For now, just switch to the selected quality source
    const source = sources.find(s => s.quality === quality) || sources[0];
    if (videoRef.current && source) {
      const currentTime = videoRef.current.currentTime;
      videoRef.current.src = source.url;
      videoRef.current.currentTime = currentTime;
    }
  }

  function jumpToChapter(chapter: Chapter) {
    if (videoRef.current) {
      videoRef.current.currentTime = chapter.startTime;
      setShowChapters(false);
    }
  }

  function handleCast() {
    if (isCasting) {
      stopCasting();
    } else {
      const currentSource = sources.find(s => s.quality === currentQuality) || sources[0];
      startCasting({
        title,
        videoUrl: currentSource.url,
        contentType: 'video/mp4',
        imageUrl: poster
      });
    }
  }

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-full'}`}
      style={{ filter: `brightness(${brightness}%)` }}
      {...gestureHandlers}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
        style={{ background: 'black' }}
      >
        {sources.map((source, index) => (
          <source key={index} src={source.url} type="video/mp4" />
        ))}
        {availableSubtitles.map(subtitle => (
          <track
            key={subtitle.id}
            kind="subtitles"
            src={subtitle.url}
            srcLang={subtitle.language}
            label={subtitle.label}
            default={subtitle.default}
          />
        ))}
      </video>

      {/* Subtitle Display */}
      {currentCue && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded text-center max-w-4xl">
          <div dangerouslySetInnerHTML={{ __html: currentCue.text.replace(/\n/g, '<br>') }} />
        </div>
      )}

      {/* Loading Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
      )}

      {/* Controls */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <h1 className="text-lg font-semibold truncate">{title}</h1>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsLocked(!isLocked)}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                {isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              </Button>
              
              <Button
                onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Keyboard className="h-4 w-4" />
              </Button>

              {isCastAvailable && (
                <Button
                  onClick={handleCast}
                  size="sm"
                  variant="ghost"
                  className={`text-white hover:bg-white/20 ${isCasting ? 'bg-primary' : ''}`}
                >
                  <Cast className="h-4 w-4" />
                </Button>
              )}

              <Button
                onClick={() => setShowSettings(!showSettings)}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Settings className="h-4 w-4" />
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
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={(value) => {
                if (videoRef.current) {
                  videoRef.current.currentTime = value[0];
                }
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white/70 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={seekBackward}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Rewind className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={togglePlayPause}
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              
              <Button
                onClick={seekForward}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <FastForward className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  onClick={toggleMute}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <div className="w-20">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={100}
                    step={1}
                    onValueChange={(value) => {
                      setVolume(value[0]);
                      if (videoRef.current) {
                        videoRef.current.volume = value[0] / 100;
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {chapters.length > 0 && (
                <Button
                  onClick={() => setShowChapters(!showChapters)}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  Chapters
                </Button>
              )}

              {availableSubtitles.length > 0 && (
                <Select value={currentSubtitle} onValueChange={setCurrentSubtitle}>
                  <SelectTrigger className="w-auto h-8 bg-white/20 border-white/30 text-white">
                    <Subtitles className="h-4 w-4" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off</SelectItem>
                    {availableSubtitles.map(subtitle => (
                      <SelectItem key={subtitle.id} value={subtitle.id}>
                        {subtitle.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button
                onClick={toggleFullscreen}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 min-w-64">
          <div className="space-y-4 text-white">
            <div>
              <label className="text-sm mb-2 block">Quality</label>
              <Select value={currentQuality} onValueChange={handleQualityChange}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  {sources.map(source => (
                    <SelectItem key={source.quality} value={source.quality}>
                      {source.quality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm mb-2 block">Playback Speed</label>
              <Select value={playbackRate.toString()} onValueChange={(value) => {
                const rate = parseFloat(value);
                setPlaybackRate(rate);
                if (videoRef.current) {
                  videoRef.current.playbackRate = rate;
                }
              }}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                    <SelectItem key={rate} value={rate.toString()}>
                      {rate}x
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm mb-2 block">Brightness</label>
              <Slider
                value={[brightness]}
                onValueChange={(value) => setBrightness(value[0])}
                max={150}
                min={50}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Chapter Navigation */}
      {showChapters && chapters.length > 0 && (
        <div className="absolute bottom-20 left-4 right-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 max-h-64 overflow-y-auto">
          <h3 className="text-white font-semibold mb-3">Chapters</h3>
          <div className="grid gap-2">
            {chapters.map(chapter => (
              <Button
                key={chapter.id}
                onClick={() => jumpToChapter(chapter)}
                variant="ghost"
                className="text-left justify-start text-white hover:bg-white/20 h-auto p-2"
              >
                <div>
                  <div className="font-medium">{chapter.title}</div>
                  <div className="text-xs text-white/70">{formatTime(chapter.startTime)}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard Help */}
      {showKeyboardHelp && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-black/90 rounded-lg p-6 max-w-md">
            <h3 className="text-white font-semibold mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-sm text-white/80">
              <div className="flex justify-between">
                <span>Play/Pause</span>
                <span>Space</span>
              </div>
              <div className="flex justify-between">
                <span>Seek Forward</span>
                <span>→</span>
              </div>
              <div className="flex justify-between">
                <span>Seek Backward</span>
                <span>←</span>
              </div>
              <div className="flex justify-between">
                <span>Volume Up</span>
                <span>↑</span>
              </div>
              <div className="flex justify-between">
                <span>Volume Down</span>
                <span>↓</span>
              </div>
              <div className="flex justify-between">
                <span>Mute</span>
                <span>M</span>
              </div>
              <div className="flex justify-between">
                <span>Fullscreen</span>
                <span>F</span>
              </div>
            </div>
            <Button
              onClick={() => setShowKeyboardHelp(false)}
              className="w-full mt-4"
              variant="outline"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Lock Indicator */}
      {isLocked && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 rounded-full p-3">
          <Lock className="h-6 w-6 text-white" />
        </div>
      )}
    </div>
  );
};
