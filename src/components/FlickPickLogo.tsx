
import React from 'react';
import { Film } from 'lucide-react';

interface FlickPickLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const FlickPickLogo: React.FC<FlickPickLogoProps> = ({ 
  className = "", 
  size = 'md', 
  showIcon = true 
}) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showIcon && (
        <div className="relative">
          <Film className={`${iconSizes[size]} text-primary`} />
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 opacity-20 rounded blur-sm" />
        </div>
      )}
      <span className={`${sizeClasses[size]} font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent`}>
        FlickPick
      </span>
    </div>
  );
};
