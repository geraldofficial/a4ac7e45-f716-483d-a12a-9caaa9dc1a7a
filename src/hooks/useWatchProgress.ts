import { useState, useEffect, useCallback, useRef } from 'react';
import { watchHistoryService } from '@/services/watchHistory';

interface UseWatchProgressProps {
  tmdbId: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  season?: number;
  episode?: number;
  currentSource?: string;
}

export const useWatchProgress = ({
  tmdbId,
  type,
  title,
  posterPath,
  season,
  episode,
  currentSource
}: UseWatchProgressProps) => {
  const [lastSavedTime, setLastSavedTime] = useState(0);
  const saveIntervalRef = useRef<NodeJS.Timeout>();
  const currentTimeRef = useRef(0);

  // Get resume position
  const getResumePosition = useCallback(() => {
    const resumeInfo = watchHistoryService.getResumeInfo(tmdbId, type, season, episode);
    return resumeInfo.shouldResume ? resumeInfo.progress : 0;
  }, [tmdbId, type, season, episode]);

  // Save progress
  const saveProgress = useCallback((currentTime: number, duration?: number) => {
    if (currentTime < 10) return; // Don't save if less than 10 seconds
    
    // Only save if we've moved at least 10 seconds since last save
    if (Math.abs(currentTime - lastSavedTime) < 10) return;
    
    watchHistoryService.updateProgress(
      tmdbId,
      type,
      currentTime,
      season,
      episode,
      duration,
      currentSource
    );
    setLastSavedTime(currentTime);
  }, [tmdbId, type, season, episode, currentSource, lastSavedTime]);

  // Initialize watch history entry
  const initializeWatchHistory = useCallback(() => {
    watchHistoryService.addToHistory({
      tmdbId,
      type,
      title,
      poster_path: posterPath,
      season,
      episode,
      progress: 0,
      lastSource: currentSource
    });
  }, [tmdbId, type, title, posterPath, season, episode, currentSource]);

  // Update current time (for periodic saving)
  const updateCurrentTime = useCallback((time: number) => {
    currentTimeRef.current = time;
  }, []);

  // Set up periodic saving
  useEffect(() => {
    initializeWatchHistory();
    
    saveIntervalRef.current = setInterval(() => {
      if (currentTimeRef.current > 10) {
        saveProgress(currentTimeRef.current);
      }
    }, 30000); // Save every 30 seconds

    return () => {
      // Save progress on unmount
      if (currentTimeRef.current > 10) {
        saveProgress(currentTimeRef.current);
      }
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [initializeWatchHistory, saveProgress]);

  return {
    getResumePosition,
    saveProgress,
    updateCurrentTime,
    initializeWatchHistory
  };
};
