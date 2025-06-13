
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children, className = '' }) => {
  const { bind, isPulling, isRefreshing, pullDistance, shouldRefresh } = usePullToRefresh({ onRefresh });

  return (
    <div {...bind()} className={`relative ${className}`} style={{ touchAction: 'pan-y' }}>
      {/* Pull to refresh indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-10"
        style={{
          transform: `translateY(${Math.min(pullDistance - 60, 0)}px)`,
          opacity: isPulling ? 1 : 0
        }}
      >
        <div className={`bg-background/90 backdrop-blur-sm border border-border rounded-full p-3 shadow-lg transition-all duration-200 ${shouldRefresh ? 'scale-110 bg-primary/10' : ''}`}>
          <RefreshCw 
            className={`h-5 w-5 transition-all duration-200 ${
              isRefreshing ? 'animate-spin text-primary' : 
              shouldRefresh ? 'text-primary scale-110' : 'text-muted-foreground'
            }`} 
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ transform: `translateY(${isPulling ? Math.min(pullDistance * 0.5, 40) : 0}px)` }}>
        {children}
      </div>
    </div>
  );
};
