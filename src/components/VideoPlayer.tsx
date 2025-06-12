
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { streamingSources, getStreamingUrl } from '@/services/streaming';

interface VideoPlayerProps {
  title: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  title, 
  tmdbId, 
  type, 
  season, 
  episode 
}) => {
  const [currentSource, setCurrentSource] = useState(0);

  const handleSourceChange = (sourceIndex: number) => {
    setCurrentSource(sourceIndex);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <span className="text-white text-sm self-center mr-2">Sources:</span>
        {streamingSources.map((source, index) => (
          <Button
            key={source.name}
            variant={currentSource === index ? "default" : "outline"}
            size="sm"
            onClick={() => handleSourceChange(index)}
            className={currentSource === index ? "bg-purple-600" : "border-white/30 text-white hover:bg-white/10"}
          >
            {source.name}
          </Button>
        ))}
      </div>
      
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={getStreamingUrl(tmdbId, type, currentSource, season, episode)}
          title={title}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          allowFullScreen
          allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
          style={{ border: 'none' }}
        />
      </div>
    </div>
  );
};
