import React from 'react';
import { Spinner } from '@/components/ui/spinner';

interface LoadingFallbackProps {
  message?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <img
          src="https://cdn.builder.io/api/v1/assets/3a5e046f24294e60a3c1afd0f4c614eb/chatgpt-image-jun-21-2025-03_27_04-pm-65410f?format=webp&width=800"
          alt="FlickPick"
          className="h-10 w-auto mx-auto"
        />
        <Spinner size="lg" />
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
};
