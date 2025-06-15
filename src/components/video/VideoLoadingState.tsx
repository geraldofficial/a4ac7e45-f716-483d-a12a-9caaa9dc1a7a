
import React from 'react';
import { ProductionLoadingSpinner } from '../ProductionLoadingSpinner';

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
    <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-50">
      <div className="text-center space-y-4 p-6">
        <ProductionLoadingSpinner size="lg" showLogo={true} />
        <div className="space-y-2">
          <h3 className="text-white text-lg font-medium">{title}</h3>
          <p className="text-white/70">{message}</p>
          {progress !== undefined && (
            <div className="w-64 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
