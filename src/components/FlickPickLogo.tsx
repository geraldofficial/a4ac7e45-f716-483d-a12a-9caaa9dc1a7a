
import React from 'react';

interface FlickPickLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
  responsive?: boolean; // New prop for responsive behavior
}

export const FlickPickLogo: React.FC<FlickPickLogoProps> = ({ 
  className = "", 
  size = 'md', 
  showIcon = true,
  showText = true,
  responsive = false
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
            src="/lovable-uploads/1dbe7566-e61a-43fb-8913-7b44138a0ff1.png" 
            alt="FlickPick Logo" 
            className={`${logoSizes[size]} object-contain rounded-lg`}
          />
        </div>
      )}
      {showText && (
        <span className={`${sizeClasses[size]} font-bold text-foreground ${
          responsive ? 'hidden md:inline' : ''
        }`}>
          FlickPick
        </span>
      )}
    </div>
  );
};
