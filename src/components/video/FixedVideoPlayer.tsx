
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FixedVideoPlayerProps {
  title: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  onError?: (error: string) => void;
}

export const FixedVideoPlayer: React.FC<FixedVideoPlayerProps> = ({
  title,
  tmdbId,
  type,
  season,
  episode,
  onError
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSource, setCurrentSource] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Multiple streaming sources to try
  const streamingSources = [
    {
      name: 'VidSrc',
      getUrl: () => {
        const baseUrl = 'https://vidsrc.to/embed';
        if (type === 'movie') {
          return `${baseUrl}/movie/${tmdbId}`;
        } else {
          return `${baseUrl}/tv/${tmdbId}/${season || 1}/${episode || 1}`;
        }
      }
    },
    {
      name: 'SuperEmbed',
      getUrl: () => {
        const baseUrl = 'https://multiembed.mov';
        if (type === 'movie') {
          return `${baseUrl}/directstream.php?video_id=${tmdbId}&tmdb=1`;
        } else {
          return `${baseUrl}/directstream.php?video_id=${tmdbId}&tmdb=1&s=${season || 1}&e=${episode || 1}`;
        }
      }
    },
    {
      name: 'SmashyStream',
      getUrl: () => {
        const baseUrl = 'https://player.smashy.stream';
        if (type === 'movie') {
          return `${baseUrl}/movie/${tmdbId}`;
        } else {
          return `${baseUrl}/tv/${tmdbId}?s=${season || 1}&e=${episode || 1}`;
        }
      }
    }
  ];

  const handleSourceChange = () => {
    const nextSource = (currentSource + 1) % streamingSources.length;
    setCurrentSource(nextSource);
    setError(null);
  };

  const handleIframeError = () => {
    const errorMessage = `Failed to load from ${streamingSources[currentSource].name}`;
    setError(errorMessage);
    onError?.(errorMessage);
  };

  const handleFullscreen = () => {
    if (iframeRef.current) {
      iframeRef.current.requestFullscreen();
    }
  };

  useEffect(() => {
    setError(null);
  }, [currentSource]);

  const currentUrl = streamingSources[currentSource].getUrl();

  return (
    <Card className="w-full overflow-hidden">
      <div className="relative aspect-video bg-black">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
            <Alert variant="destructive" className="max-w-md mx-4">
              <AlertDescription className="text-center">
                <p className="mb-3">{error}</p>
                <Button 
                  onClick={handleSourceChange}
                  variant="outline"
                  size="sm"
                >
                  Try Another Source ({streamingSources[(currentSource + 1) % streamingSources.length].name})
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={currentUrl}
            title={title}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-presentation allow-top-navigation"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </div>

      {/* Custom Controls */}
      <div className="p-4 bg-background border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-8 w-8 p-0"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className="h-8 w-8 p-0"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSourceChange}
              className="h-8 px-3 text-xs"
            >
              <Settings className="h-3 w-3 mr-1" />
              {streamingSources[currentSource].name}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFullscreen}
              className="h-8 w-8 p-0"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="mt-2">
          <h3 className="text-sm font-medium truncate">{title}</h3>
          {type === 'tv' && (
            <p className="text-xs text-muted-foreground">
              Season {season} • Episode {episode}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
