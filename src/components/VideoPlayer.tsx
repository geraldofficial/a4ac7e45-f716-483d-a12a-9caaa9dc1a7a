
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { streamingSources, getStreamingUrl } from '@/services/streaming';
import { tmdbApi } from '@/services/tmdb';

interface VideoPlayerProps {
  title: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
}

interface Episode {
  id: number;
  name: string;
  episode_number: number;
  air_date: string;
  overview: string;
}

interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  title, 
  tmdbId, 
  type, 
  season = 1, 
  episode = 1 
}) => {
  const [currentSource, setCurrentSource] = useState(0);
  const [currentSeason, setCurrentSeason] = useState(season);
  const [currentEpisode, setCurrentEpisode] = useState(episode);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (type === 'tv') {
      fetchSeasons();
    }
  }, [type, tmdbId]);

  useEffect(() => {
    if (type === 'tv' && currentSeason) {
      fetchEpisodes(currentSeason);
    }
  }, [currentSeason, type, tmdbId]);

  const fetchSeasons = async () => {
    try {
      const tvDetails = await tmdbApi.getTVDetails(tmdbId);
      if (tvDetails.seasons) {
        setSeasons(tvDetails.seasons.filter(s => s.season_number > 0));
      }
    } catch (error) {
      console.error('Error fetching seasons:', error);
    }
  };

  const fetchEpisodes = async (seasonNumber: number) => {
    setLoading(true);
    try {
      const seasonDetails = await tmdbApi.getTVSeasonDetails(tmdbId, seasonNumber);
      if (seasonDetails.episodes) {
        setEpisodes(seasonDetails.episodes);
      }
    } catch (error) {
      console.error('Error fetching episodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSourceChange = (sourceIndex: number) => {
    setCurrentSource(sourceIndex);
  };

  const handleSeasonChange = (seasonNumber: string) => {
    setCurrentSeason(parseInt(seasonNumber));
    setCurrentEpisode(1);
  };

  const handleEpisodeChange = (episodeNumber: string) => {
    setCurrentEpisode(parseInt(episodeNumber));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-foreground text-sm self-center mr-2">Sources:</span>
        {streamingSources.map((source, index) => (
          <Button
            key={source.name}
            variant={currentSource === index ? "default" : "outline"}
            size="sm"
            onClick={() => handleSourceChange(index)}
            className={currentSource === index ? "bg-primary" : "border-border text-foreground hover:bg-accent"}
          >
            {source.name}
          </Button>
        ))}
      </div>

      {type === 'tv' && seasons.length > 0 && (
        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex items-center gap-2">
            <span className="text-foreground text-sm">Season:</span>
            <Select value={currentSeason.toString()} onValueChange={handleSeasonChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {seasons.map((season) => (
                  <SelectItem key={season.id} value={season.season_number.toString()}>
                    Season {season.season_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {episodes.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-foreground text-sm">Episode:</span>
              <Select value={currentEpisode.toString()} onValueChange={handleEpisodeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {episodes.map((ep) => (
                    <SelectItem key={ep.id} value={ep.episode_number.toString()}>
                      {ep.episode_number}. {ep.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
      
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={getStreamingUrl(tmdbId, type, currentSource, currentSeason, currentEpisode)}
          title={`${title} ${type === 'tv' ? `S${currentSeason}E${currentEpisode}` : ''}`}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          allowFullScreen
          allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
          style={{ border: 'none' }}
        />
      </div>

      {type === 'tv' && episodes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
          {episodes.map((ep) => (
            <Button
              key={ep.id}
              variant={currentEpisode === ep.episode_number ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentEpisode(ep.episode_number)}
              className="justify-start text-left h-auto p-2"
            >
              <div>
                <div className="font-medium">Ep {ep.episode_number}</div>
                <div className="text-xs text-muted-foreground truncate">{ep.name}</div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
