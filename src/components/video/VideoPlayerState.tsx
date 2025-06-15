
import React from 'react';
import { ProductionLoadingSpinner } from '../ProductionLoadingSpinner';
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
      <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
        <div className="text-center space-y-4">
          <ProductionLoadingSpinner 
            size="lg" 
            text={`Loading ${title}...`}
            showLogo={true}
          />
          <p className="text-white/70 text-sm">Connecting to {currentSourceName}</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-white mb-2 text-xl font-semibold">Playback Error</h3>
          <p className="text-white/70 mb-2">Failed to load from {currentSourceName}</p>
          {errorMessage && (
            <p className="text-white/60 mb-6 text-sm">{errorMessage}</p>
          )}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={onSwitchSource}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Try Next Source
            </Button>
            <Button
              onClick={onRetry}
              variant="outline"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
