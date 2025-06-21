import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { Volume2, VolumeX, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrailerPlayerProps {
  videoKey: string;
  title: string;
  backdropPath?: string;
  onClose?: () => void;
}

export const TrailerPlayer: React.FC<TrailerPlayerProps> = ({
  videoKey,
  title,
  backdropPath,
  onClose,
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0); // Used to force iframe reload
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const toggleMuteAndRestart = useCallback(() => {
    // If currently muted, unmute and restart video from beginning
    if (isMuted) {
      setIsMuted(false);
      // Force iframe reload to restart video with sound
      setKey((prev) => prev + 1);
    } else {
      // If unmuted, mute the video (but don't restart)
      setIsMuted(true);
    }
  }, [isMuted]);

  // Memoize the YouTube URL to prevent unnecessary re-renders
  const youtubeUrl = useMemo(
    () =>
      `https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${videoKey}&iv_load_policy=3&fs=0&disablekb=1&start=0`,
    [videoKey, isMuted, key],
  );

  // Memoize the backdrop image URL
  const backdropUrl = useMemo(
    () =>
      backdropPath ? `https://image.tmdb.org/t/p/w1280${backdropPath}` : null,
    [backdropPath],
  );

  if (hasError) {
    return (
      <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            loading="lazy"
          />
        )}
        <div className="relative z-10 text-center text-white p-6">
          <Play className="h-16 w-16 mx-auto mb-4 opacity-70" />
          <p className="text-lg font-semibold">Trailer not available</p>
          <p className="text-sm opacity-70 mt-2">
            Unable to load trailer for {title}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}

      {/* Sound/Play Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMuteAndRestart}
        className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70 rounded-full w-12 h-12 p-0 backdrop-blur-sm transition-all duration-200 hover:scale-105"
        title={isMuted ? "Play with sound (restarts video)" : "Mute video"}
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </Button>

      {/* Auto-playing trailer */}
      <iframe
        key={key} // This forces the iframe to reload when key changes
        ref={iframeRef}
        className="w-full h-full"
        src={youtubeUrl}
        title={`${title} Trailer`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={false}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          pointerEvents: "none",
        }}
      />

      {/* Overlay to prevent clicking on the video */}
      <div
        className="absolute inset-0 z-5"
        style={{ pointerEvents: "auto" }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};
