
import { useRef, useCallback } from 'react';

interface AnalyticsEvent {
  type: 'play' | 'pause' | 'seek' | 'quality_change' | 'error' | 'complete' | 'buffer';
  timestamp: number;
  currentTime?: number;
  duration?: number;
  quality?: string;
  error?: string;
  bufferDuration?: number;
}

interface VideoAnalyticsData {
  videoId: string;
  title: string;
  duration: number;
  events: AnalyticsEvent[];
  totalWatchTime: number;
  completionPercentage: number;
  averageQuality: string;
  bufferEvents: number;
}

export const useVideoAnalytics = (videoId: string, title: string) => {
  const eventsRef = useRef<AnalyticsEvent[]>([]);
  const sessionStartRef = useRef<number>(Date.now());
  const lastPositionRef = useRef<number>(0);
  const watchTimeRef = useRef<number>(0);

  const trackEvent = useCallback((event: Omit<AnalyticsEvent, 'timestamp'>) => {
    const analyticsEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now()
    };
    
    eventsRef.current.push(analyticsEvent);
    
    // Log to console for debugging (replace with actual analytics service)
    console.log('Video Analytics:', analyticsEvent);
  }, []);

  const updateWatchTime = useCallback((currentTime: number) => {
    const timeDiff = Math.abs(currentTime - lastPositionRef.current);
    
    // Only count as watch time if the difference is reasonable (no seeking)
    if (timeDiff < 2) {
      watchTimeRef.current += timeDiff;
    }
    
    lastPositionRef.current = currentTime;
  }, []);

  const getAnalyticsData = useCallback((duration: number): VideoAnalyticsData => {
    const qualityEvents = eventsRef.current.filter(e => e.type === 'quality_change');
    const bufferEvents = eventsRef.current.filter(e => e.type === 'buffer');
    
    return {
      videoId,
      title,
      duration,
      events: eventsRef.current,
      totalWatchTime: watchTimeRef.current,
      completionPercentage: duration > 0 ? (watchTimeRef.current / duration) * 100 : 0,
      averageQuality: qualityEvents.length > 0 ? qualityEvents[qualityEvents.length - 1].quality || 'auto' : 'auto',
      bufferEvents: bufferEvents.length
    };
  }, [videoId, title]);

  const sendAnalytics = useCallback(async (data: VideoAnalyticsData) => {
    try {
      // Replace with your analytics endpoint
      console.log('Sending analytics data:', data);
      
      // Example: await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
    } catch (error) {
      console.error('Error sending analytics:', error);
    }
  }, []);

  return {
    trackEvent,
    updateWatchTime,
    getAnalyticsData,
    sendAnalytics
  };
};
