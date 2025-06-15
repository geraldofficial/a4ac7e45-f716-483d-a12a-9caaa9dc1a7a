
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Settings, Subtitles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface VideoSource {
  url: string;
  quality: string;
  type: string;
}

interface Subtitle {
  url: string;
  language: string;
  label: string;
}

interface EnhancedVideoPlayerProps {
  sources: VideoSource[];
  title: string;
  thumbnailUrl?: string;
  subtitles?: Subtitle[];
  autoPlay?: boolean;
  onProgress?: (progress: number, duration: number) => void;
  onComplete?: () => void;
  initialProgress?: number;
  className?: string;
}

export const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  sources,
  title,
  thumbnailUrl,
  subtitles = [],
  autoPlay = false,
  onProgress,
  onComplete,
  initialProgress = 0,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState(sources[0]?.quality || 'auto');
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('off');
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Hide controls after 3 seconds of inactivity
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (initialProgress > 0) {
        video.currentTime = initialProgress;
      }
      setError(null);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onProgress?.(video.currentTime, video.duration);
    };

    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    const handleError = () => {
      setError('Failed to load video. Retrying...');
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          video.load();
        }, 2000);
      } else {
        setError('Video playback failed. Please try again later.');
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [initialProgress, onProgress, onComplete, retryCount]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => {
        setError('Playback failed. Please try again.');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const volumeValue = newVolume[0] / 100;
    video.volume = volumeValue;
    setVolume(newVolume[0]);
    setIsMuted(volumeValue === 0);
  };

  const handleSeek = (newTime: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = newTime[0];
    setCurrentTime(newTime[0]);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      video.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCurrentSource = () => {
    return sources.find(source => source.quality === selectedQuality) || sources[0];
  };

  const retry = () => {
    setError(null);
    setRetryCount(0);
    videoRef.current?.load();
  };

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={thumbnailUrl}
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
      >
        <source src={getCurrentSource()?.url} type={getCurrentSource()?.type} />
        {subtitles.map(subtitle => (
          <track
            key={subtitle.language}
            kind="subtitles"
            src={subtitle.url}
            srcLang={subtitle.language}
            label={subtitle.label}
            default={subtitle.language === selectedSubtitle}
          />
        ))}
        Your browser does not support the video tag.
      </video>

      {/* Loading/Buffering Overlay */}
      {(isBuffering && !error) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/75">
          <div className="text-center text-white p-4">
            <p className="mb-4">{error}</p>
            <Button onClick={retry} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
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
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="w-full"
                />
              </div>
            </div>

            <div className="text-sm text-white/90 ml-4">
              {title}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quality Selector */}
            {sources.length > 1 && (
              <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                <SelectTrigger className="w-20 h-8 bg-white/20 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sources.map(source => (
                    <SelectItem key={source.quality} value={source.quality}>
                      {source.quality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Subtitle Selector */}
            {subtitles.length > 0 && (
              <Select value={selectedSubtitle} onValueChange={setSelectedSubtitle}>
                <SelectTrigger className="w-auto h-8 bg-white/20 border-white/30 text-white">
                  <Subtitles className="h-4 w-4" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off</SelectItem>
                  {subtitles.map(subtitle => (
                    <SelectItem key={subtitle.language} value={subtitle.language}>
                      {subtitle.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quality Badge */}
      {selectedQuality && (
        <Badge className="absolute top-4 right-4 bg-black/50 text-white">
          {selectedQuality}
        </Badge>
      )}
    </div>
  );
};
