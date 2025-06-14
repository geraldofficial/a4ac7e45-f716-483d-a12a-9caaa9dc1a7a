
import React from 'react';

interface ProductionLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  showLogo?: boolean;
}

export const ProductionLoadingSpinner: React.FC<ProductionLoadingSpinnerProps> = ({
  size = 'md',
  text,
  showLogo = false
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {showLogo && (
        <div className="text-primary font-bold text-2xl mb-2">
          FlickPick
        </div>
      )}
      
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} border-4 border-primary/20 rounded-full animate-spin`}></div>
        
        {/* Inner spinning ring */}
        <div className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-t-primary rounded-full animate-spin`}></div>
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {text && (
        <p className={`text-muted-foreground ${textSizes[size]} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Netflix-style skeleton loader
export const NetflixStyleSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer rounded-lg h-full"></div>
    </div>
  );
};

// Movie card skeleton
export const MovieCardSkeleton: React.FC = () => {
  return (
    <div className="bg-card/50 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-gradient-to-br from-muted to-muted/50"></div>
      <div className="p-3 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
        <div className="h-3 bg-muted rounded w-2/3"></div>
      </div>
    </div>
  );
};
