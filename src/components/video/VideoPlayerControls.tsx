
import React from 'react';
import { Button } from '@/components/ui/button';
import { streamingSources } from '@/services/streaming';
import { RotateCcw, X, Maximize, SkipForward } from 'lucide-react';

interface VideoPlayerControlsProps {
  title: string;
  currentSourceIndex: number;
  onSourceChange: (index: number) => void;
  onReload: () => void;
  onFullscreen: () => void;
  onClose?: () => void;
  hasError: boolean;
}

export const VideoPlayerControls: React.FC<VideoPlayerControlsProps> = ({
  title,
  currentSourceIndex,
  onSourceChange,
  onReload,
  onFullscreen,
  onClose,
  hasError
}) => {
  const currentSource = streamingSources[currentSourceIndex];

  const switchToNextSource = () => {
    const nextIndex = (currentSourceIndex + 1) % streamingSources.length;
    onSourceChange(nextIndex);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-white text-lg font-semibold truncate max-w-[200px] md:max-w-none">
            {title}
          </h1>
          <span className="text-white/60 text-sm bg-primary px-2 py-1 rounded hidden md:inline">
            {currentSource.name}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {hasError && (
            <Button
              onClick={switchToNextSource}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            onClick={onReload}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={onFullscreen}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20 hidden md:flex"
          >
            <Maximize className="h-4 w-4" />
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

      {/* Source Selector */}
      <div className="p-4 bg-black/80 backdrop-blur-sm">
        <div className="flex gap-2 overflow-x-auto">
          {streamingSources.slice(0, 8).map((source, index) => (
            <Button
              key={source.name}
              onClick={() => onSourceChange(index)}
              size="sm"
              variant={index === currentSourceIndex ? "default" : "outline"}
              className={`flex-shrink-0 text-xs ${
                index === currentSourceIndex 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-black/50 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              {source.name}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};
