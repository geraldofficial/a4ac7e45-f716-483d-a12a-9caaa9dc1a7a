import React from 'react';
import { Spinner } from '@/components/ui/spinner';

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
  const spinnerSize = size === 'xl' ? 'lg' : size;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {showLogo && (
        <img
          src="https://cdn.builder.io/api/v1/assets/3a5e046f24294e60a3c1afd0f4c614eb/chatgpt-image-jun-21-2025-03_27_04-pm-65410f?format=webp&width=800"
          alt="FlickPick"
          className="h-8 md:h-10 w-auto"
        />
      )}
      <Spinner size={spinnerSize} />
      {text && <p className="text-muted-foreground text-sm">{text}</p>}
    </div>
  );
};

export const NetflixStyleSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-muted rounded-lg h-full" />
  </div>
);

export const MovieCardSkeleton: React.FC = () => (
  <div className="bg-card/50 rounded-lg overflow-hidden animate-pulse">
    <div className="aspect-[2/3] bg-muted" />
    <div className="p-2 space-y-1.5">
      <div className="h-3 bg-muted rounded w-3/4" />
      <div className="h-2.5 bg-muted rounded w-1/2" />
    </div>
  </div>
);
