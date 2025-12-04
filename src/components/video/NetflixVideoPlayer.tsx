import React, { useState, useCallback, useRef, useEffect } from "react";
import { streamingSources, getStreamingUrl, getSourcesByReliability } from "@/services/streaming";
import { tmdbApi } from "@/services/tmdb";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Server,
  X,
  Maximize,
  Minimize,
  PictureInPicture2,
  List,
  Gauge,
  SkipForward,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EpisodeList } from "./EpisodeList";

interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
}

interface NetflixVideoPlayerProps {
  title: string;
  tmdbId: number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
  posterPath?: string;
  onClose?: () => void;
}

const PLAYBACK_SPEEDS = [0.5, 1, 1.25, 1.5, 2];

export const NetflixVideoPlayer: React.FC<NetflixVideoPlayerProps> = ({
  title,
  tmdbId,
  type,
  season = 1,
  episode = 1,
  posterPath,
  onClose,
}) => {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSeason, setCurrentSeason] = useState(season);
  const [currentEpisode, setCurrentEpisode] = useState(episode);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const sortedSources = getSourcesByReliability();
  const currentSource = sortedSources[currentSourceIndex];
  const currentUrl = getStreamingUrl(
    tmdbId, 
    type, 
    currentSourceIndex, 
    type === "tv" ? currentSeason : undefined, 
    type === "tv" ? currentEpisode : undefined
  );

  const displayTitle = type === "tv"
    ? `${title} - S${currentSeason}E${currentEpisode}`
    : title;

  // Check if there's a next episode
  const hasNextEpisode = useCallback(() => {
    if (type !== "tv" || seasons.length === 0) return false;
    const currentSeasonData = seasons.find(s => s.season_number === currentSeason);
    if (!currentSeasonData) return false;
    
    // Check if there's another episode in current season
    if (currentEpisode < currentSeasonData.episode_count) return true;
    
    // Check if there's a next season
    const nextSeason = seasons.find(s => s.season_number === currentSeason + 1);
    return !!nextSeason && nextSeason.episode_count > 0;
  }, [type, seasons, currentSeason, currentEpisode]);

  // Play next episode
  const playNextEpisode = useCallback(() => {
    if (!hasNextEpisode()) return;
    
    const currentSeasonData = seasons.find(s => s.season_number === currentSeason);
    if (!currentSeasonData) return;

    if (currentEpisode < currentSeasonData.episode_count) {
      // Next episode in same season
      setCurrentEpisode(prev => prev + 1);
    } else {
      // First episode of next season
      setCurrentSeason(prev => prev + 1);
      setCurrentEpisode(1);
    }
    
    setIsLoading(true);
    setHasError(false);
    toast({
      title: "Playing next episode",
      description: `Loading next episode...`,
    });
  }, [hasNextEpisode, seasons, currentSeason, currentEpisode, toast]);

  // Fetch TV show seasons
  useEffect(() => {
    if (type === "tv") {
      const fetchSeasons = async () => {
        try {
          const data = await tmdbApi.getTVShowDetails(tmdbId);
          if (data.seasons) {
            setSeasons(data.seasons);
          }
        } catch (error) {
          console.error("Error fetching seasons:", error);
        }
      };
      fetchSeasons();
    }
  }, [tmdbId, type]);

  // Handle controls visibility with tap/click
  const handleContainerClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="menu"]')) {
      return;
    }
    
    setShowControls(prev => !prev);
    setShowSourceMenu(false);
    setShowSpeedMenu(false);
    
    if (!showControls) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (!showSourceMenu && !showEpisodeList && !showSpeedMenu) {
          setShowControls(false);
        }
      }, 4000);
    }
  }, [showControls, showSourceMenu, showEpisodeList, showSpeedMenu]);

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (!showSourceMenu && !showEpisodeList && !showSpeedMenu) {
          setShowControls(false);
        }
      }, 4000);
    };

    const handleMouseMove = () => resetControlsTimeout();

    window.addEventListener("mousemove", handleMouseMove);
    resetControlsTimeout();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showSourceMenu, showEpisodeList, showSpeedMenu]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

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
    const downloadUrl = type === "movie" 
      ? `https://dl.vidsrc.vip/movie/${tmdbId}`
      : `https://dl.vidsrc.vip/tv/${tmdbId}/${currentSeason}/${currentEpisode}`;
    window.open(downloadUrl, "_blank", "noopener,noreferrer");
    toast({
      title: "Download",
      description: "Opening download page in new tab...",
    });
  }, [tmdbId, type, currentSeason, currentEpisode, toast]);

  const handleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  }, []);

  const handlePiP = useCallback(() => {
    setIsPiPActive(!isPiPActive);
    toast({
      title: isPiPActive ? "Exiting mini player" : "Mini player mode",
      description: isPiPActive ? "Back to fullscreen" : "Continue browsing while watching",
    });
  }, [isPiPActive, toast]);

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    toast({
      title: "Playback speed",
      description: `Speed set to ${speed}x`,
    });
  }, [toast]);

  const handleSelectEpisode = useCallback((newSeason: number, newEpisode: number) => {
    setCurrentSeason(newSeason);
    setCurrentEpisode(newEpisode);
    setIsLoading(true);
    setHasError(false);
    toast({
      title: "Loading episode",
      description: `S${newSeason}E${newEpisode}`,
    });
  }, [toast]);

  const containerStyles = isPiPActive
    ? "fixed bottom-20 right-4 w-80 h-48 z-50 rounded-lg overflow-hidden shadow-2xl border border-border"
    : "fixed inset-0 z-50 bg-black";

  return (
    <div
      ref={containerRef}
      id="video-player-container"
      className={containerStyles}
      onClick={handleContainerClick}
    >
      {/* Episode List Overlay */}
      {showEpisodeList && type === "tv" && seasons.length > 0 && (
        <EpisodeList
          tmdbId={tmdbId}
          seasons={seasons}
          currentSeason={currentSeason}
          currentEpisode={currentEpisode}
          onSelectEpisode={handleSelectEpisode}
          onClose={() => setShowEpisodeList(false)}
        />
      )}

      {/* Top Bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 transition-opacity duration-300 ${
          showControls && !showEpisodeList ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-gradient-to-b from-black/90 via-black/50 to-transparent p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isPiPActive) {
                    setIsPiPActive(false);
                  } else {
                    onClose?.();
                  }
                }}
                className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </button>
              {!isPiPActive && (
                <div className="hidden sm:block">
                  <h1 className="text-white font-semibold text-base md:text-lg truncate max-w-md">
                    {displayTitle}
                  </h1>
                  <p className="text-gray-400 text-xs">
                    Source: {currentSource.name} • {playbackSpeed}x
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              {/* Episode List (TV only) */}
              {type === "tv" && !isPiPActive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEpisodeList(true);
                  }}
                  className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                  title="Episodes"
                >
                  <List className="h-5 w-5 text-white" />
                </button>
              )}

              {/* Playback Speed */}
              {!isPiPActive && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSpeedMenu(!showSpeedMenu);
                      setShowSourceMenu(false);
                    }}
                    className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                    title="Playback Speed"
                  >
                    <Gauge className="h-5 w-5 text-white" />
                  </button>

                  {showSpeedMenu && (
                    <div 
                      className="absolute right-0 top-full mt-2 w-32 bg-gray-900/95 backdrop-blur-lg rounded-lg border border-gray-700 shadow-2xl overflow-hidden z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-2 border-b border-gray-700">
                        <h3 className="text-white font-semibold text-xs">Speed</h3>
                      </div>
                      {PLAYBACK_SPEEDS.map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={`w-full px-3 py-2 flex items-center justify-between hover:bg-gray-800 transition-colors ${
                            speed === playbackSpeed ? "bg-primary/20" : ""
                          }`}
                        >
                          <span className="text-white text-sm">{speed}x</span>
                          {speed === playbackSpeed && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Download Button */}
              {!isPiPActive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                  title="Download"
                >
                  <Download className="h-5 w-5 text-white" />
                </button>
              )}

              {/* Source Selector */}
              {!isPiPActive && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSourceMenu(!showSourceMenu);
                      setShowSpeedMenu(false);
                    }}
                    className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                    title="Change Source"
                  >
                    <Server className="h-5 w-5 text-white" />
                  </button>

                  {showSourceMenu && (
                    <div 
                      className="absolute right-0 top-full mt-2 w-64 bg-gray-900/95 backdrop-blur-lg rounded-lg border border-gray-700 shadow-2xl overflow-hidden z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-3 border-b border-gray-700">
                        <h3 className="text-white font-semibold text-sm">Select Source</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {sortedSources.map((source, index) => (
                          <button
                            key={source.name}
                            onClick={() => switchSource(index)}
                            className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800 transition-colors ${
                              index === currentSourceIndex ? "bg-primary/20" : ""
                            }`}
                          >
                            <div className="text-left">
                              <p className="text-white text-sm font-medium">{source.name}</p>
                              <p className="text-gray-400 text-xs capitalize">
                                {source.reliability} reliability
                              </p>
                            </div>
                            {index === currentSourceIndex && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Picture-in-Picture */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePiP();
                }}
                className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                title="Picture-in-Picture"
              >
                <PictureInPicture2 className="h-5 w-5 text-white" />
              </button>

              {/* Fullscreen */}
              {!isPiPActive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFullscreen();
                  }}
                  className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                  title="Fullscreen"
                >
                  {isFullscreen ? (
                    <Minimize className="h-5 w-5 text-white" />
                  ) : (
                    <Maximize className="h-5 w-5 text-white" />
                  )}
                </button>
              )}

              {/* Close (mobile) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isPiPActive) {
                    setIsPiPActive(false);
                    onClose?.();
                  } else {
                    onClose?.();
                  }
                }}
                className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors sm:hidden"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar with Next Episode */}
      {type === "tv" && hasNextEpisode() && !isPiPActive && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-20 transition-opacity duration-300 ${
            showControls && !showEpisodeList ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="sm:hidden">
                <p className="text-white text-sm font-medium truncate">{displayTitle}</p>
                <p className="text-gray-400 text-xs">{currentSource.name}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playNextEpisode();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors ml-auto"
              >
                <SkipForward className="h-4 w-4" />
                <span className="text-sm font-medium">Next Episode</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Title Bar (non-TV) */}
      {!isPiPActive && type !== "tv" && (
        <div
          className={`absolute bottom-4 left-0 right-0 z-10 sm:hidden transition-opacity duration-300 ${
            showControls && !showEpisodeList ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="px-4">
            <h1 className="text-white font-semibold text-sm truncate">
              {displayTitle}
            </h1>
            <p className="text-gray-400 text-xs">
              {currentSource.name}
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !showEpisodeList && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
          <div className="text-center space-y-3">
            <Spinner size={isPiPActive ? "md" : "lg"} />
            {!isPiPActive && (
              <p className="text-white text-sm">Loading from {currentSource.name}...</p>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && !showEpisodeList && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-30">
          <div className="text-center space-y-3 p-4 max-w-sm">
            <div className="w-12 h-12 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
              <X className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-white">Playback Error</h3>
            <p className="text-gray-400 text-sm">
              Unable to load from {currentSource.name}
            </p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRetry();
                }}
                className="bg-white text-black hover:bg-gray-200"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  tryNextSource();
                }}
                variant="outline"
                size="sm"
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
          visibility: isLoading || hasError || showEpisodeList ? "hidden" : "visible",
        }}
      />

      {/* Tap indicator */}
      {!showControls && !isPiPActive && !showEpisodeList && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-white/30 text-sm">Tap to show controls</div>
        </div>
      )}
    </div>
  );
};
