import React from 'react';
import { Spinner } from '@/components/ui/spinner';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text, 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Spinner size={size} />
      {text && <p className="text-muted-foreground text-sm">{text}</p>}
    </div>
  );
};
