
import React, { useState, useEffect, useRef } from 'react';
import { streamingSources, getStreamingUrl } from '@/services/streaming';
import { VideoPlayerState } from './VideoPlayerState';
import { EnhancedVideoPlayerControls } from './EnhancedVideoPlayerControls';
import { VideoPlayerIframe, VideoPlayerIframeRef } from './VideoPlayerIframe';
import { VideoPlayerSubtitles } from './VideoPlayerSubtitles';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useChromecast } from '@/hooks/useChromecast';
import { useSubtitles } from '@/hooks/useSubtitles';

interface VideoPlayerContainerProps {
  title: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  resumeFrom?: number;
  onProgress?: (currentTime: number, duration: number) => void;
  onError?: (error: string) => void;
  onSourceChange?: (sourceIndex: number) => void;
  onCastToggle?: (isCasting: boolean) => void;
}

export const VideoPlayerContainer: React.FC<VideoPlayerContainerProps> = ({
  title,
  tmdbId,
  type,
  season,
  episode,
  resumeFrom = 0,
  onProgress,
  onError,
  onSourceChange,
  onCastToggle
}) => {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentAudioTrack, setCurrentAudioTrack] = useState('default');
  
  const iframeRef = useRef<VideoPlayerIframeRef>(null);

  const currentUrl = getStreamingUrl(tmdbId, type, currentSourceIndex, season, episode);
  const currentSource = streamingSources[currentSourceIndex];

  // Chromecast integration
  const { isCastAvailable, isCasting, startCasting, stopCasting } = useChromecast();

  // Enhanced subtitles with more options
  const availableSubtitles = [
    {
      id: 'en',
      language: 'en',
      label: 'English',
      url: '/subtitles/en.vtt'
    },
    {
      id: 'es',
      language: 'es', 
      label: 'Spanish',
      url: '/subtitles/es.vtt'
    },
    {
      id: 'fr',
      language: 'fr',
      label: 'French',
      url: '/subtitles/fr.vtt'
    },
    {
      id: 'de',
      language: 'de',
      label: 'German',
      url: '/subtitles/de.vtt'
    }
  ];

  // Mock audio tracks
  const availableAudioTracks = [
    {
      id: 'default',
      language: 'en',
      label: 'English (Stereo)'
    },
    {
      id: 'en-5.1',
      language: 'en',
      label: 'English (5.1 Surround)'
    },
    {
      id: 'es',
      language: 'es',
      label: 'Spanish (Stereo)'
    },
    {
      id: 'fr',
      language: 'fr',
      label: 'French (Stereo)'
    }
  ];

  // Subtitles integration
  const { 
    currentSubtitle, 
    setCurrentSubtitle, 
    currentCue, 
    updateCurrentCue 
  } = useSubtitles(availableSubtitles);

  // Keyboard shortcuts integration
  useKeyboardShortcuts({
    onPlayPause: () => {
      setIsPlaying(!isPlaying);
    },
    onSeekForward: () => {
      const newTime = Math.min(duration, currentTime + 10);
      setCurrentTime(newTime);
    },
    onSeekBackward: () => {
      const newTime = Math.max(0, currentTime - 10);
      setCurrentTime(newTime);
    },
    onVolumeUp: () => {
      const newVolume = Math.min(100, volume + 10);
      setVolume(newVolume);
    },
    onVolumeDown: () => {
      const newVolume = Math.max(0, volume - 10);
      setVolume(newVolume);
    },
    onMute: () => {
      setIsMuted(!isMuted);
    },
    onFullscreen: () => {
      iframeRef.current?.requestFullscreen();
    }
  }, true);

  const switchSource = () => {
    const nextIndex = (currentSourceIndex + 1) % streamingSources.length;
    setCurrentSourceIndex(nextIndex);
    setHasError(false);
    setIsLoading(true);
    onSourceChange?.(nextIndex);
  };

  const reloadPlayer = () => {
    setIsLoading(true);
    setHasError(false);
    // Force iframe reload by updating the src
    setCurrentSourceIndex(currentSourceIndex);
  };

  const handleIframeLoad = () => {
    setTimeout(() => {
      setIsLoading(false);
      setHasError(false);
    }, 2000);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.(`Failed to load from ${currentSource.name}`);
  };

  const handleCastToggle = async () => {
    if (isCasting) {
      await stopCasting();
      onCastToggle?.(false);
    } else if (isCastAvailable) {
      const castMedia = {
        title: getDisplayTitle(),
        videoUrl: currentUrl,
        contentType: 'video/mp4',
        imageUrl: `https://image.tmdb.org/t/p/w500/poster.jpg`
      };
      await startCasting(castMedia);
      onCastToggle?.(true);
    }
  };

  const getDisplayTitle = () => {
    if (type === 'tv' && season && episode) {
      return `${title} - S${season}E${episode}`;
    }
    return title;
  };

  useEffect(() => {
    // Simulate progress tracking and subtitle updates
    const interval = setInterval(() => {
      if (!isLoading && !hasError && isPlaying) {
        const newTime = currentTime + 1;
        setCurrentTime(newTime);
        updateCurrentCue(newTime);
        onProgress?.(newTime, duration || 3600);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, hasError, isPlaying, currentTime, duration, onProgress, updateCurrentCue]);

  return (
    <div className="relative w-full h-full">
      <VideoPlayerState
        isLoading={isLoading}
        hasError={hasError}
        title={getDisplayTitle()}
        currentSourceName={currentSource.name}
        onRetry={reloadPlayer}
        onSwitchSource={switchSource}
      />

      {/* Enhanced Controls */}
      <div className="absolute top-0 left-0 right-0 z-10 opacity-0 hover:opacity-100 transition-opacity">
        <EnhancedVideoPlayerControls
          title={getDisplayTitle()}
          currentSourceIndex={currentSourceIndex}
          currentSubtitle={currentSubtitle}
          currentAudioTrack={currentAudioTrack}
          availableSubtitles={availableSubtitles}
          availableAudioTracks={availableAudioTracks}
          isCastAvailable={isCastAvailable}
          isCasting={isCasting}
          onSourceChange={setCurrentSourceIndex}
          onSubtitleChange={setCurrentSubtitle}
          onAudioTrackChange={setCurrentAudioTrack}
          onCastToggle={handleCastToggle}
          onReload={reloadPlayer}
          onFullscreen={() => iframeRef.current?.requestFullscreen()}
          hasError={hasError}
        />
      </div>

      {/* Subtitles Display */}
      <VideoPlayerSubtitles currentCue={currentCue} />

      {/* Video Iframe */}
      <VideoPlayerIframe
        ref={iframeRef}
        src={`${currentUrl}&t=${resumeFrom}`}
        title={getDisplayTitle()}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />
    </div>
  );
};
