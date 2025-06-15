
import React from 'react';

interface SubtitleCue {
  text: string;
}

interface VideoPlayerSubtitlesProps {
  currentCue: SubtitleCue | null;
  className?: string;
}

export const VideoPlayerSubtitles: React.FC<VideoPlayerSubtitlesProps> = ({
  currentCue,
  className = "absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded text-center max-w-lg z-20"
}) => {
  if (!currentCue) {
    return null;
  }

  return (
    <div className={className}>
      {currentCue.text}
    </div>
  );
};
