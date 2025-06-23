import React from "react";
import { EnhancedVideoPlayerCore } from "./EnhancedVideoPlayerCore";

interface VideoPlayerContainerProps {
  title: string;
  tmdbId: number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
  resumeFrom?: number;
  onProgress?: (currentTime: number, duration: number) => void;
  onError?: (error: string) => void;
  onSourceChange?: (sourceIndex: number) => void;
  onCastToggle?: (isCasting: boolean) => void;
}

export const VideoPlayerContainer: React.FC<VideoPlayerContainerProps> = ({
  title,
  tmdbId,
  type,
  season,
  episode,
  resumeFrom = 0,
  onProgress,
  onError,
  onSourceChange,
  onCastToggle,
}) => {
  return (
    <EnhancedVideoPlayerCore
      title={title}
      tmdbId={tmdbId}
      type={type}
      season={season}
      episode={episode}
      resumeFrom={resumeFrom}
      onProgress={onProgress}
      onError={onError}
      onSourceChange={onSourceChange}
      className="w-full h-full"
    />
  );
};
