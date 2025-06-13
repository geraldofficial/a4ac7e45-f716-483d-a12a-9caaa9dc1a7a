
import { useCallback, useRef, useState } from 'react';
import { useGesture } from 'react-use-gesture';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  resistance?: number;
}

export const usePullToRefresh = ({ onRefresh, threshold = 100, resistance = 0.3 }: UsePullToRefreshOptions) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    triggerHaptic();
    
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setIsPulling(false);
      setPullDistance(0);
    }
  }, [onRefresh, isRefreshing]);

  const bind = useGesture({
    onDrag: ({ down, movement: [, my], velocity: [, vy], direction: [, dy] }) => {
      if (window.scrollY > 0) return;
      
      if (down && dy > 0) {
        const distance = Math.max(0, my * resistance);
        setPullDistance(distance);
        setIsPulling(distance > threshold / 2);
        
        if (distance > threshold && !isRefreshing) {
          triggerHaptic();
        }
      } else if (isPulling && pullDistance > threshold && !isRefreshing) {
        handleRefresh();
      } else {
        setIsPulling(false);
        setPullDistance(0);
      }
    }
  });

  return {
    bind,
    isPulling,
    isRefreshing,
    pullDistance,
    shouldRefresh: pullDistance > threshold
  };
};
