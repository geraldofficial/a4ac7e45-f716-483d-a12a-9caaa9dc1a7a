
import React from 'react';
import { EnhancedVideoPlayerV2 } from './EnhancedVideoPlayerV2';
import { watchHistoryService } from '@/services/watchHistory';
import { streamingSources, getStreamingUrl } from '@/services/streaming';

interface VideoPlayerProps {
  title: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  autoFullscreen?: boolean;
  poster_path?: string;
  backdrop_path?: string;
  duration?: number;
  shouldResume?: boolean;
  onClose?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  // Get resume information if shouldResume is true
  let resumeFrom = 0;
  
  if (props.shouldResume) {
    const resumeInfo = watchHistoryService.getResumeInfo(
      props.tmdbId, 
      props.type, 
      props.season, 
      props.episode
    );
    
    if (resumeInfo.shouldResume) {
      resumeFrom = resumeInfo.progress;
      console.log(`Resuming ${props.title} from ${Math.floor(resumeFrom)}s`);
    }
  }

  // Convert streaming sources to video sources
  const videoSources = streamingSources.map((source, index) => ({
    url: getStreamingUrl(props.tmdbId, props.type, index, props.season, props.episode),
    quality: source.name,
    bandwidth: source.quality === 'HD' ? 5000000 : source.quality === 'SD' ? 2000000 : 1000000
  }));

  // Mock subtitles - in a real app, these would come from your API
  const subtitles = [
    {
      id: 'en',
      language: 'en',
      label: 'English',
      url: '/api/subtitles/en.vtt', // This would be a real subtitle URL
      default: true
    },
    {
      id: 'es',
      language: 'es', 
      label: 'Español',
      url: '/api/subtitles/es.vtt'
    }
  ];

  // Mock chapters - in a real app, these would come from your API
  const chapters = props.type === 'movie' ? [
    {
      id: '1',
      title: 'Opening',
      startTime: 0,
      thumbnailUrl: props.poster_path
    },
    {
      id: '2', 
      title: 'Main Story',
      startTime: 600,
      thumbnailUrl: props.poster_path
    },
    {
      id: '3',
      title: 'Climax',
      startTime: 3600,
      thumbnailUrl: props.poster_path
    }
  ] : [];

  const handleProgress = (currentTime: number, duration: number) => {
    // Update watch history
    watchHistoryService.addToHistory({
      tmdbId: props.tmdbId,
      type: props.type,
      title: props.title,
      poster_path: props.poster_path,
      backdrop_path: props.backdrop_path,
      season: props.season,
      episode: props.episode,
      progress: currentTime,
      duration: duration
    });

    props.onProgress?.(currentTime, duration);
  };

  return (
    <EnhancedVideoPlayerV2
      title={props.title}
      videoId={`${props.tmdbId}-${props.type}-${props.season || 0}-${props.episode || 0}`}
      sources={videoSources}
      subtitles={subtitles}
      chapters={chapters}
      poster={props.poster_path ? `https://image.tmdb.org/t/p/w500${props.poster_path}` : undefined}
      autoPlay={true}
      onProgress={handleProgress}
      onComplete={props.onComplete}
      onClose={props.onClose}
    />
  );
};
