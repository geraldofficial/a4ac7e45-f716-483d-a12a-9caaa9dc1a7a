import React from 'react';

interface FlickPickLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
}

export const FlickPickLogo: React.FC<FlickPickLogoProps> = ({ 
  className = "", 
  size = 'md', 
  showIcon = true,
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const iconSizes = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showIcon && (
        <div className="relative">
          <img 
            src="/favicon.ico" 
            alt="FlickPick logo" 
            className={`${iconSizes[size]} object-contain filter grayscale`}
          />
        </div>
      )}
      {showText && (
        <span className={`${sizeClasses[size]} font-bold text-foreground hidden md:block`}>
          FlickPick
        </span>
      )}
    </div>
  );
};
