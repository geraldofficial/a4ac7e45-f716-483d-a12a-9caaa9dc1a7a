import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Subtitles,
  Download,
  Share2,
  Heart,
  MessageCircle,
  MoreHorizontal,
  PictureInPicture,
  RotateCcw,
  RotateCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatError } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  className?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onEnded?: () => void;
  subtitles?: {
    url: string;
    language: string;
    label: string;
  }[];
  qualityOptions?: {
    label: string;
    url: string;
    isDefault?: boolean;
  }[];
}

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isPiP: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  playbackRate: number;
  selectedQuality: string;
  selectedSubtitles: string;
  showControls: boolean;
  error: string | null;
}

const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const NonSandboxedVideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title = "Video",
  poster,
  autoPlay = false,
  className = "",
  onTimeUpdate,
  onDurationChange,
  onEnded,
  subtitles = [],
  qualityOptions = [],
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    isPiP: false,
    isLoading: true,
    isBuffering: false,
    playbackRate: 1,
    selectedQuality:
      qualityOptions.find((q) => q.isDefault)?.label ||
      qualityOptions[0]?.label ||
      "HD",
    selectedSubtitles: "off",
    showControls: true,
    error: null,
  });

  // Initialize video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () =>
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const handleLoadedData = () =>
      setState((prev) => ({ ...prev, isLoading: false }));
    const handleCanPlay = () =>
      setState((prev) => ({ ...prev, isBuffering: false }));
    const handleWaiting = () =>
      setState((prev) => ({ ...prev, isBuffering: true }));
    const handlePlay = () => setState((prev) => ({ ...prev, isPlaying: true }));
    const handlePause = () =>
      setState((prev) => ({ ...prev, isPlaying: false }));
    const handleEnded = () => {
      setState((prev) => ({ ...prev, isPlaying: false }));
      onEnded?.();
    };

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      setState((prev) => ({ ...prev, currentTime }));
      onTimeUpdate?.(currentTime);
    };

    const handleDurationChange = () => {
      const duration = video.duration;
      setState((prev) => ({ ...prev, duration }));
      onDurationChange?.(duration);
    };

    const handleVolumeChange = () => {
      setState((prev) => ({
        ...prev,
        volume: video.volume,
        isMuted: video.muted,
      }));
    };

    const handleError = () => {
      const error = video.error;
      let errorMessage = "An error occurred while playing the video.";

      if (error) {
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = "Video playback was aborted.";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = "Network error occurred while loading video.";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = "Video format is not supported.";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "Video source is not supported.";
            break;
        }
      }

      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
    };

    // Event listeners
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("error", handleError);
    };
  }, [onTimeUpdate, onDurationChange, onEnded]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlayPause();
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seek(state.currentTime - (e.shiftKey ? 30 : 10));
          break;
        case "ArrowRight":
          e.preventDefault();
          seek(state.currentTime + (e.shiftKey ? 30 : 10));
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(Math.min(1, state.volume + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(Math.max(0, state.volume - 0.1));
          break;
        case "Digit0":
        case "Digit1":
        case "Digit2":
        case "Digit3":
        case "Digit4":
        case "Digit5":
        case "Digit6":
        case "Digit7":
        case "Digit8":
        case "Digit9":
          e.preventDefault();
          const percent = parseInt(e.code.slice(-1)) / 10;
          seek(state.duration * percent);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [state.currentTime, state.duration, state.volume]);

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      setState((prev) => ({ ...prev, showControls: true }));

      if (state.isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setState((prev) => ({ ...prev, showControls: false }));
        }, 3000);
      }
    };

    const handleMouseMove = () => resetControlsTimeout();
    const handleMouseLeave = () => {
      if (state.isPlaying) {
        setState((prev) => ({ ...prev, showControls: false }));
      }
    };

    if (containerRef.current) {
      containerRef.current.addEventListener("mousemove", handleMouseMove);
      containerRef.current.addEventListener("mouseleave", handleMouseLeave);
    }

    resetControlsTimeout();

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (containerRef.current) {
        containerRef.current.removeEventListener("mousemove", handleMouseMove);
        containerRef.current.removeEventListener(
          "mouseleave",
          handleMouseLeave,
        );
      }
    };
  }, [state.isPlaying]);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (state.isPlaying) {
      video.pause();
    } else {
      video.play().catch((error) => {
        console.error("Error playing video:", formatError(error));
        setState((prev) => ({
          ...prev,
          error: "Failed to play video. Please try again.",
        }));
      });
    }
  }, [state.isPlaying]);

  const seek = useCallback(
    (time: number) => {
      const video = videoRef.current;
      if (!video) return;

      const clampedTime = Math.max(0, Math.min(time, state.duration));
      video.currentTime = clampedTime;
    },
    [state.duration],
  );

  const setVolume = useCallback((volume: number) => {
    const video = videoRef.current;
    if (!video) return;

    const clampedVolume = Math.max(0, Math.min(1, volume));
    video.volume = clampedVolume;
    video.muted = clampedVolume === 0;
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setState((prev) => ({ ...prev, isFullscreen: true }));
      } else {
        await document.exitFullscreen();
        setState((prev) => ({ ...prev, isFullscreen: false }));
      }
    } catch (error) {
      console.error("Fullscreen error:", formatError(error));
    }
  }, []);

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !document.pictureInPictureEnabled) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setState((prev) => ({ ...prev, isPiP: false }));
      } else {
        await video.requestPictureInPicture();
        setState((prev) => ({ ...prev, isPiP: true }));
      }
    } catch (error) {
      console.error("Picture-in-Picture error:", formatError(error));
    }
  }, []);

  const changePlaybackRate = useCallback((rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setState((prev) => ({ ...prev, playbackRate: rate }));
  }, []);

  const changeQuality = useCallback(
    (quality: string) => {
      const video = videoRef.current;
      if (!video) return;

      const qualityOption = qualityOptions.find((q) => q.label === quality);
      if (!qualityOption) return;

      const currentTime = video.currentTime;
      const wasPlaying = !video.paused;

      video.src = qualityOption.url;
      video.currentTime = currentTime;

      if (wasPlaying) {
        video.play();
      }

      setState((prev) => ({ ...prev, selectedQuality: quality }));
    },
    [qualityOptions],
  );

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickTime = (clickX / width) * state.duration;

    seek(clickTime);
  };

  if (state.error) {
    return (
      <div
        className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}
      >
        <div className="flex items-center justify-center h-64 text-center p-8">
          <div>
            <div className="text-red-400 mb-4">
              <MoreHorizontal className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">
              Playback Error
            </h3>
            <p className="text-gray-400 mb-4">{state.error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600/10"
            >
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      tabIndex={0}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        className="w-full h-full object-contain"
        onContextMenu={(e) => e.preventDefault()} // Disable right-click
        controlsList="nodownload" // Disable download button
        disablePictureInPicture={false}
        playsInline
      >
        {/* Subtitles */}
        {subtitles.map((subtitle, index) => (
          <track
            key={index}
            kind="subtitles"
            src={subtitle.url}
            srcLang={subtitle.language}
            label={subtitle.label}
            default={state.selectedSubtitles === subtitle.language}
          />
        ))}
        Your browser does not support the video tag.
      </video>

      {/* Loading Overlay */}
      {(state.isLoading || state.isBuffering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-white animate-spin mx-auto mb-2" />
            <p className="text-white text-sm">
              {state.isLoading ? "Loading..." : "Buffering..."}
            </p>
          </div>
        </div>
      )}

      {/* Center Play Button */}
      {!state.isPlaying && !state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="icon"
            onClick={togglePlayPause}
            className="h-20 w-20 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all transform hover:scale-110"
          >
            <Play className="h-8 w-8 fill-current" />
          </Button>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 transition-opacity duration-300 ${
          state.showControls || !state.isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/logo.svg" alt="FlickPick" className="h-8 w-auto" />
            <h3 className="text-white font-medium">{title}</h3>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-black/50 text-white">
              {state.selectedQuality}
            </Badge>
            {state.playbackRate !== 1 && (
              <Badge variant="outline" className="border-white/50 text-white">
                {state.playbackRate}x
              </Badge>
            )}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {/* Progress Bar */}
          <div
            ref={progressBarRef}
            className="w-full h-2 bg-white/20 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-red-600 rounded-full relative"
              style={{
                width: `${(state.currentTime / state.duration) * 100}%`,
              }}
            >
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlayPause}
                className="text-white hover:bg-white/20"
              >
                {state.isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 fill-current" />
                )}
              </Button>

              {/* Skip Back */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => seek(state.currentTime - 10)}
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              {/* Skip Forward */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => seek(state.currentTime + 10)}
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="h-5 w-5" />
              </Button>

              {/* Volume */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {state.isMuted || state.volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                <div className="w-20">
                  <Slider
                    value={[state.isMuted ? 0 : state.volume * 100]}
                    onValueChange={([value]) => setVolume(value / 100)}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              {/* Time Display */}
              <div className="text-white text-sm">
                {formatTime(state.currentTime)} / {formatTime(state.duration)}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Settings Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-700 text-white">
                  {/* Playback Speed */}
                  <DropdownMenuItem className="hover:bg-gray-800">
                    <span className="mr-2">Speed</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <span className="ml-auto">{state.playbackRate}x</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {PLAYBACK_RATES.map((rate) => (
                          <DropdownMenuItem
                            key={rate}
                            onClick={() => changePlaybackRate(rate)}
                            className={
                              state.playbackRate === rate ? "bg-red-600" : ""
                            }
                          >
                            {rate}x
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </DropdownMenuItem>

                  {/* Quality */}
                  {qualityOptions.length > 0 && (
                    <DropdownMenuItem className="hover:bg-gray-800">
                      <span className="mr-2">Quality</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <span className="ml-auto">
                            {state.selectedQuality}
                          </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {qualityOptions.map((option) => (
                            <DropdownMenuItem
                              key={option.label}
                              onClick={() => changeQuality(option.label)}
                              className={
                                state.selectedQuality === option.label
                                  ? "bg-red-600"
                                  : ""
                              }
                            >
                              {option.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </DropdownMenuItem>
                  )}

                  {/* Subtitles */}
                  {subtitles.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="hover:bg-gray-800">
                        <Subtitles className="h-4 w-4 mr-2" />
                        Subtitles
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Picture in Picture */}
              {document.pictureInPictureEnabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePiP}
                  className="text-white hover:bg-white/20"
                >
                  <PictureInPicture className="h-5 w-5" />
                </Button>
              )}

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {state.isFullscreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
