import React, { useState, useEffect, useRef, useCallback } from "react";
import { streamingSources, getStreamingUrl } from "@/services/streaming";
import { VideoPlayerState } from "./VideoPlayerState";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, AlertTriangle, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnhancedVideoPlayerCoreProps {
  title: string;
  tmdbId: number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
  resumeFrom?: number;
  onProgress?: (currentTime: number, duration: number) => void;
  onError?: (error: string) => void;
  onSourceChange?: (sourceIndex: number) => void;
  className?: string;
}

export const EnhancedVideoPlayerCore: React.FC<
  EnhancedVideoPlayerCoreProps
> = ({
  title,
  tmdbId,
  type,
  season,
  episode,
  resumeFrom = 0,
  onProgress,
  onError,
  onSourceChange,
  className = "",
}) => {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [canPlay, setCanPlay] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const maxLoadAttempts = 3;
  const loadTimeout = 15000; // 15 seconds

  const currentUrl = getStreamingUrl(
    tmdbId,
    type,
    currentSourceIndex,
    season,
    episode,
  );
  const currentSource = streamingSources[currentSourceIndex];

  const clearLoadTimeout = useCallback(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = undefined;
    }
  }, []);

  const setLoadTimeout = useCallback(() => {
    clearLoadTimeout();
    loadTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setHasError(true);
        onError?.(`Timeout loading from ${currentSource.name}`);
      }
    }, loadTimeout);
  }, [isLoading, currentSource.name, onError, clearLoadTimeout]);

  const switchSource = useCallback(() => {
    const nextIndex = (currentSourceIndex + 1) % streamingSources.length;
    setCurrentSourceIndex(nextIndex);
    setHasError(false);
    setIsLoading(true);
    setLoadAttempts(0);
    setCanPlay(false);
    onSourceChange?.(nextIndex);

    toast({
      title: "Switching source",
      description: `Trying ${streamingSources[nextIndex].name}...`,
    });
  }, [currentSourceIndex, onSourceChange, toast]);

  const reloadPlayer = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    setCanPlay(false);

    const newAttempts = loadAttempts + 1;
    setLoadAttempts(newAttempts);

    if (newAttempts >= maxLoadAttempts) {
      // Auto switch to next source after max attempts
      switchSource();
      return;
    }

    if (iframeRef.current) {
      // Force iframe reload by changing src
      const timestamp = Date.now();
      iframeRef.current.src = `${currentUrl}&reload=${timestamp}`;
    }

    setLoadTimeout();
  }, [loadAttempts, currentUrl, switchSource, setLoadTimeout]);

  const openInNewTab = useCallback(() => {
    window.open(currentUrl, "_blank", "noopener,noreferrer");
  }, [currentUrl]);

  const handleIframeLoad = useCallback(() => {
    clearLoadTimeout();
    setIsLoading(false);
    setHasError(false);
    setCanPlay(true);
    setLoadAttempts(0);
  }, [clearLoadTimeout]);

  const handleIframeError = useCallback(() => {
    clearLoadTimeout();
    setIsLoading(false);
    setHasError(true);
    setCanPlay(false);
    onError?.(`Failed to load from ${currentSource.name}`);
  }, [clearLoadTimeout, currentSource.name, onError]);

  const getDisplayTitle = useCallback(() => {
    if (type === "tv" && season && episode) {
      return `${title} - S${season}E${episode}`;
    }
    return title;
  }, [title, type, season, episode]);

  // Initialize player
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setCanPlay(false);
    setLoadTimeout();

    return () => clearLoadTimeout();
  }, [currentUrl, setLoadTimeout, clearLoadTimeout]);

  // Progress tracking simulation
  useEffect(() => {
    if (!canPlay || hasError) return;

    const interval = setInterval(() => {
      const mockTime = (Date.now() % 7200000) / 1000; // 2 hour loop
      onProgress?.(mockTime, 7200); // Mock 2 hour duration
    }, 5000);

    return () => clearInterval(interval);
  }, [canPlay, hasError, onProgress]);

  // Auto-retry logic
  useEffect(() => {
    if (hasError && loadAttempts < maxLoadAttempts) {
      const retryTimeout = setTimeout(() => {
        reloadPlayer();
      }, 2000); // Retry after 2 seconds

      return () => clearTimeout(retryTimeout);
    }
  }, [hasError, loadAttempts, reloadPlayer]);

  return (
    <div className={`relative w-full h-full bg-black ${className}`}>
      {/* Loading/Error State Overlay */}
      <VideoPlayerState
        isLoading={isLoading}
        hasError={hasError}
        title={getDisplayTitle()}
        currentSourceName={currentSource.name}
        onRetry={reloadPlayer}
        onSwitchSource={switchSource}
      />

      {/* Enhanced Error Display */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-20">
          <div className="text-center space-y-4 p-6 max-w-md">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
            <h3 className="text-xl font-semibold text-white">Playback Error</h3>
            <p className="text-gray-300 text-sm">
              Unable to load video from {currentSource.name}
              {loadAttempts > 0 &&
                ` (Attempt ${loadAttempts}/${maxLoadAttempts})`}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {loadAttempts < maxLoadAttempts ? (
                <Button
                  onClick={reloadPlayer}
                  className="bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry ({maxLoadAttempts - loadAttempts} left)
                </Button>
              ) : (
                <Button
                  onClick={switchSource}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Try Next Source
                </Button>
              )}

              <Button
                onClick={openInNewTab}
                variant="outline"
                size="sm"
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Direct
              </Button>
            </div>

            <div className="text-xs text-gray-400">
              Source {currentSourceIndex + 1} of {streamingSources.length}
            </div>
          </div>
        </div>
      )}

      {/* Source Quality Indicator */}
      {!hasError && !isLoading && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white">
            {currentSource.name} • {currentSource.reliability}
          </div>
        </div>
      )}

      {/* Video Iframe */}
      <iframe
        ref={iframeRef}
        src={`${currentUrl}&t=${resumeFrom}&autoplay=1`}
        title={getDisplayTitle()}
        className="w-full h-full border-0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; microphone; camera"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        referrerPolicy="no-referrer-when-downgrade"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-popups-to-escape-sandbox"
        style={{
          visibility: isLoading || hasError ? "hidden" : "visible",
          opacity: canPlay ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Fallback Content */}
      {hasError && loadAttempts >= maxLoadAttempts && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-yellow-900/90 backdrop-blur-sm border border-yellow-600 rounded-lg p-4">
            <p className="text-yellow-200 text-sm mb-3">
              All sources failed. You can try opening the video directly or try
              again later.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setCurrentSourceIndex(0);
                  setLoadAttempts(0);
                  reloadPlayer();
                }}
                size="sm"
                variant="outline"
                className="border-yellow-600 text-yellow-200 hover:bg-yellow-800"
              >
                Reset & Retry
              </Button>
              <Button
                onClick={openInNewTab}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700 text-black"
              >
                Open External
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
