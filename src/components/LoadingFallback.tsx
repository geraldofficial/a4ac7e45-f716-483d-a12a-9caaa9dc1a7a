
import React from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface LoadingFallbackProps {
  message?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
