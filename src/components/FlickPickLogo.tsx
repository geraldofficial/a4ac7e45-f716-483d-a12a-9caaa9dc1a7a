
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
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const logoSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showIcon && (
        <div className="relative">
          <img 
            src="/lovable-uploads/0bb41fd4-6209-45e7-a375-a53cedfcb322.png" 
            alt="FlickPick Logo" 
            className={`${logoSizes[size]} object-contain`}
          />
        </div>
      )}
      {showText && (
        <span className={`${sizeClasses[size]} font-bold text-foreground`}>
          FlickPick
        </span>
      )}
    </div>
  );
};
