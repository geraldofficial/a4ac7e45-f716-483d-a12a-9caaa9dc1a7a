
import React from 'react';

interface ProductionLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const ProductionLoadingSpinner: React.FC<ProductionLoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`animate-spin rounded-full border-2 border-white border-t-transparent ${sizeClasses[size]}`} />
      {text && (
        <p className="text-white text-sm font-medium">{text}</p>
      )}
    </div>
  );
};
