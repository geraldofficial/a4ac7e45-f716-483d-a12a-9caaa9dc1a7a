
import { useRef, useCallback } from 'react';

interface GestureHandlers {
  onDoubleTap?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPinch?: (scale: number) => void;
  onVolumeSwipe?: (direction: 'up' | 'down', percentage: number) => void;
  onBrightnessSwipe?: (direction: 'up' | 'down', percentage: number) => void;
}

export const useVideoGestures = (handlers: GestureHandlers) => {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const pinchStartRef = useRef<{ distance: number } | null>(null);

  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    } else if (e.touches.length === 2) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      pinchStartRef.current = { distance };
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartRef.current && handlers.onPinch) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / pinchStartRef.current.distance;
      handlers.onPinch(scale);
      return;
    }

    // Advanced gesture handling for volume/brightness
    if (e.touches.length === 1 && touchStartRef.current) {
      const touch = e.touches[0];
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaX = touch.clientX - touchStartRef.current.x;
      
      // Check if it's a vertical swipe for volume/brightness control
      if (Math.abs(deltaY) > 20 && Math.abs(deltaY) > Math.abs(deltaX)) {
        const screenHeight = window.innerHeight;
        const swipePercentage = Math.abs(deltaY) / screenHeight;
        const direction = deltaY < 0 ? 'up' : 'down';
        
        // Left side of screen controls brightness, right side controls volume
        const isLeftSide = touch.clientX < window.innerWidth / 2;
        
        if (isLeftSide && handlers.onBrightnessSwipe) {
          handlers.onBrightnessSwipe(direction, swipePercentage);
        } else if (!isLeftSide && handlers.onVolumeSwipe) {
          handlers.onVolumeSwipe(direction, swipePercentage);
        }
      }
    }
  }, [handlers.onPinch, handlers.onVolumeSwipe, handlers.onBrightnessSwipe]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || e.touches.length > 0) return;

    const touch = e.changedTouches[0];
    const touchEnd = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;
    const deltaTime = touchEnd.time - touchStartRef.current.time;

    // Check for double tap
    const timeSinceLastTap = touchEnd.time - lastTapRef.current;
    if (timeSinceLastTap < 300 && Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30) {
      handlers.onDoubleTap?.();
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = touchEnd.time;

    // Check for swipe gestures
    const minSwipeDistance = 50;
    const maxSwipeTime = 300;

    if (deltaTime < maxSwipeTime) {
      if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      } else if (Math.abs(deltaY) > minSwipeDistance && Math.abs(deltaY) > Math.abs(deltaX)) {
        if (deltaY > 0) {
          handlers.onSwipeDown?.();
        } else {
          handlers.onSwipeUp?.();
        }
      }
    }

    touchStartRef.current = null;
    pinchStartRef.current = null;
  }, [handlers]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};
