import React from 'react';
import { Spinner } from '@/components/ui/spinner';

interface VideoLoadingStateProps {
  title: string;
  progress?: number;
  message?: string;
}

export const VideoLoadingState: React.FC<VideoLoadingStateProps> = ({
  title,
  progress,
  message = "Loading video..."
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm z-50">
      <div className="text-center space-y-4 p-4">
        <Spinner size="lg" />
        <div className="space-y-2">
          <h3 className="text-foreground text-base md:text-lg font-medium">{title}</h3>
          <p className="text-muted-foreground text-sm">{message}</p>
          {progress !== undefined && (
            <div className="w-48 md:w-64 bg-secondary rounded-full h-1.5 mx-auto">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
