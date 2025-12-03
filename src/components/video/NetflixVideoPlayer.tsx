import React, { useState, useCallback, useRef, useEffect } from "react";
import { streamingSources, getStreamingUrl, getSourcesByReliability } from "@/services/streaming";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Settings,
  Download,
  RefreshCw,
  Server,
  X,
  ChevronRight,
  Volume2,
  Maximize,
  SkipForward,
  SkipBack,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NetflixVideoPlayerProps {
  title: string;
  tmdbId: number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
  posterPath?: string;
  onClose?: () => void;
}

export const NetflixVideoPlayer: React.FC<NetflixVideoPlayerProps> = ({
  title,
  tmdbId,
  type,
  season,
  episode,
  posterPath,
  onClose,
}) => {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const sortedSources = getSourcesByReliability();
  const currentSource = sortedSources[currentSourceIndex];
  const currentUrl = getStreamingUrl(tmdbId, type, currentSourceIndex, season, episode);

  const displayTitle = type === "tv" && season && episode
    ? `${title} - S${season}E${episode}`
    : title;

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (!showSourceMenu) {
          setShowControls(false);
        }
      }, 4000);
    };

    const handleMouseMove = () => resetControlsTimeout();
    const handleTouchStart = () => resetControlsTimeout();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleTouchStart);
    resetControlsTimeout();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showSourceMenu]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const switchSource = useCallback((index: number) => {
    setCurrentSourceIndex(index);
    setIsLoading(true);
    setHasError(false);
    setShowSourceMenu(false);
    toast({
      title: "Switching source",
      description: `Loading from ${sortedSources[index].name}...`,
    });
  }, [sortedSources, toast]);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    if (iframeRef.current) {
      iframeRef.current.src = `${currentUrl}&t=${Date.now()}`;
    }
  }, [currentUrl]);

  const tryNextSource = useCallback(() => {
    const nextIndex = (currentSourceIndex + 1) % sortedSources.length;
    switchSource(nextIndex);
  }, [currentSourceIndex, sortedSources.length, switchSource]);

  const handleDownload = useCallback(() => {
    // Open download page in new tab
    const downloadUrl = `https://dl.vidsrc.vip/movie/${tmdbId}`;
    window.open(downloadUrl, "_blank", "noopener,noreferrer");
    toast({
      title: "Download",
      description: "Opening download page in new tab...",
    });
  }, [tmdbId, toast]);

  const handleFullscreen = useCallback(() => {
    const container = document.getElementById("video-player-container");
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        container.requestFullscreen();
      }
    }
  }, []);

  return (
    <div
      id="video-player-container"
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Top Bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-gradient-to-b from-black/90 via-black/50 to-transparent p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </button>
              <div className="hidden sm:block">
                <h1 className="text-white font-semibold text-lg md:text-xl truncate max-w-md">
                  {displayTitle}
                </h1>
                <p className="text-gray-400 text-sm">
                  Source: {currentSource.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="p-2 md:p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                title="Download"
              >
                <Download className="h-5 w-5 text-white" />
              </button>

              {/* Source Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowSourceMenu(!showSourceMenu)}
                  className="p-2 md:p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                  title="Change Source"
                >
                  <Server className="h-5 w-5 text-white" />
                </button>

                {showSourceMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900/95 backdrop-blur-lg rounded-lg border border-gray-700 shadow-2xl overflow-hidden">
                    <div className="p-3 border-b border-gray-700">
                      <h3 className="text-white font-semibold text-sm">Select Source</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {sortedSources.map((source, index) => (
                        <button
                          key={source.name}
                          onClick={() => switchSource(index)}
                          className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800 transition-colors ${
                            index === currentSourceIndex ? "bg-red-600/20" : ""
                          }`}
                        >
                          <div className="text-left">
                            <p className="text-white text-sm font-medium">{source.name}</p>
                            <p className="text-gray-400 text-xs capitalize">
                              {source.reliability} reliability
                            </p>
                          </div>
                          {index === currentSourceIndex && (
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={handleFullscreen}
                className="p-2 md:p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                title="Fullscreen"
              >
                <Maximize className="h-5 w-5 text-white" />
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="p-2 md:p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors sm:hidden"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Title Bar */}
      <div
        className={`absolute bottom-20 left-0 right-0 z-10 sm:hidden transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="px-4">
          <h1 className="text-white font-semibold text-base truncate">
            {displayTitle}
          </h1>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
          <div className="text-center space-y-4">
            <Spinner size="lg" />
            <p className="text-white text-sm">Loading from {currentSource.name}...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-30">
          <div className="text-center space-y-4 p-6 max-w-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-white">Playback Error</h3>
            <p className="text-gray-400 text-sm">
              Unable to load video from {currentSource.name}
            </p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleRetry}
                className="bg-white text-black hover:bg-gray-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button
                onClick={tryNextSource}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <Server className="h-4 w-4 mr-2" />
                Try Another Source
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Iframe */}
      <iframe
        ref={iframeRef}
        src={currentUrl}
        title={displayTitle}
        className="w-full h-full border-0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        style={{
          visibility: isLoading || hasError ? "hidden" : "visible",
        }}
      />

      {/* Bottom Controls - Mobile */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 sm:hidden transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
          <div className="flex items-center justify-around">
            <button className="p-3">
              <SkipBack className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={handleRetry}
              className="p-4 rounded-full bg-white/20"
            >
              <RefreshCw className="h-8 w-8 text-white" />
            </button>
            <button className="p-3">
              <SkipForward className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
