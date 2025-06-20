import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface SecureVideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  onProgress?: (progress: number) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  className?: string;
}

export const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({
  src,
  title,
  poster,
  autoPlay = false,
  muted = false,
  onProgress,
  onTimeUpdate,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState("auto");

  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Security: Content protection
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent right-click download
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Prevent common download shortcuts
    if (e.ctrlKey && (e.key === "s" || e.key === "S")) {
      e.preventDefault();
    }
  }, []);

  // Player controls
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleVolumeChange = useCallback((value: number[]) => {
    if (!videoRef.current) return;
    const newVolume = value[0];
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    if (!videoRef.current) return;
    const newTime = value[0];
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const skipTime = useCallback(
    (seconds: number) => {
      if (!videoRef.current) return;
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      videoRef.current.currentTime = newTime;
    },
    [currentTime, duration],
  );

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  const changePlaybackRate = useCallback((rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  // Event handlers
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    setCurrentTime(current);
    onTimeUpdate?.(current, total);

    if (total > 0) {
      const progress = (current / total) * 100;
      onProgress?.(progress);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  // Controls visibility
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  const handleMouseMove = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black rounded-lg overflow-hidden group",
        "focus:outline-none focus:ring-2 focus:ring-red-500",
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onContextMenu={handleContextMenu}
        className="w-full h-full object-cover"
        crossOrigin="anonymous"
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        preload="metadata"
      />

      {/* Loading overlay */}
      {duration === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
        </div>
      )}

      {/* Play/Pause overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center cursor-pointer"
        onClick={togglePlay}
      >
        {!isPlaying && duration > 0 && (
          <Button
            size="icon"
            variant="ghost"
            className="h-16 w-16 bg-black/50 hover:bg-black/70 text-white border-2 border-white/30"
          >
            <Play className="h-8 w-8 ml-1" />
          </Button>
        )}
      </div>

      {/* Controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0",
        )}
      >
        {/* Progress bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => skipTime(-10)}
              className="text-white hover:bg-white/20"
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => skipTime(10)}
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>

              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>

            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Speed control */}
            <select
              value={playbackRate}
              onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
              className="bg-transparent text-white text-sm border border-white/30 rounded px-2 py-1"
            >
              <option value={0.5} className="text-black">
                0.5x
              </option>
              <option value={0.75} className="text-black">
                0.75x
              </option>
              <option value={1} className="text-black">
                1x
              </option>
              <option value={1.25} className="text-black">
                1.25x
              </option>
              <option value={1.5} className="text-black">
                1.5x
              </option>
              <option value={2} className="text-black">
                2x
              </option>
            </select>

            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <Settings className="h-5 w-5" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Title overlay */}
      {title && (
        <div className="absolute top-4 left-4 text-white">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
    </div>
  );
};
