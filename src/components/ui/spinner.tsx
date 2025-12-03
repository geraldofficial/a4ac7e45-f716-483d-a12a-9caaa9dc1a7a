import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md',
  className 
}) => {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  return (
    <div 
      className={cn(
        "rounded-full border-primary/30 border-t-primary animate-spin",
        sizeClasses[size],
        className
      )}
      style={{ animationDuration: '0.8s' }}
    />
  );
};

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading...",
  showLogo = true 
}) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4">
      {showLogo && (
        <img
          src="https://cdn.builder.io/api/v1/assets/3a5e046f24294e60a3c1afd0f4c614eb/chatgpt-image-jun-21-2025-03_27_04-pm-65410f?format=webp&width=800"
          alt="FlickPick"
          className="h-12 w-auto"
        />
      )}
      <Spinner size="lg" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
};
