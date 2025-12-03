import React from 'react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { RefreshCw, SkipForward, AlertCircle } from 'lucide-react';

interface VideoPlayerStateProps {
  isLoading: boolean;
  hasError: boolean;
  title: string;
  currentSourceName: string;
  onRetry: () => void;
  onSwitchSource: () => void;
  errorMessage?: string;
}

export const VideoPlayerState: React.FC<VideoPlayerStateProps> = ({
  isLoading,
  hasError,
  title,
  currentSourceName,
  onRetry,
  onSwitchSource,
  errorMessage
}) => {
  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm z-10">
        <div className="text-center space-y-4 p-4">
          <Spinner size="lg" />
          <div>
            <p className="text-foreground text-sm font-medium">Loading {title}...</p>
            <p className="text-muted-foreground text-xs mt-1">Connecting to {currentSourceName}</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm z-10 p-4">
        <div className="text-center max-w-sm mx-auto p-4 rounded-lg bg-card border border-border">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <h3 className="text-foreground mb-2 text-lg font-semibold">Playback Error</h3>
          <p className="text-muted-foreground mb-2 text-sm">Failed to load from {currentSourceName}</p>
          {errorMessage && (
            <p className="text-muted-foreground mb-4 text-xs bg-destructive/10 p-2 rounded border border-destructive/20">
              {errorMessage}
            </p>
          )}
          <div className="flex gap-2 justify-center flex-wrap">
            <Button onClick={onSwitchSource} size="sm">
              <SkipForward className="h-4 w-4 mr-1" />
              Next Source
            </Button>
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
