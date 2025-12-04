import React, { useState, useEffect } from 'react';
import { tmdbApi } from '@/services/tmdb';
import { Spinner } from '@/components/ui/spinner';
import { ChevronDown, Play, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Episode {
  id: number;
  name: string;
  episode_number: number;
  air_date: string;
  overview: string;
  still_path?: string;
  runtime?: number;
}

interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
}

interface EpisodeListProps {
  tmdbId: number;
  seasons: Season[];
  currentSeason: number;
  currentEpisode: number;
  onSelectEpisode: (season: number, episode: number) => void;
  onClose: () => void;
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  tmdbId,
  seasons,
  currentSeason,
  currentEpisode,
  onSelectEpisode,
  onClose,
}) => {
  const [selectedSeason, setSelectedSeason] = useState(currentSeason);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);

  useEffect(() => {
    const fetchEpisodes = async () => {
      setLoading(true);
      try {
        const data = await tmdbApi.getTVSeasonDetails(tmdbId, selectedSeason);
        setEpisodes(data.episodes || []);
      } catch (error) {
        console.error('Error fetching episodes:', error);
        setEpisodes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [tmdbId, selectedSeason]);

  const filteredSeasons = seasons.filter(s => s.season_number > 0);

  return (
    <div className="absolute inset-0 bg-black/95 z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-white font-semibold text-lg">Episodes</h2>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white text-sm"
        >
          Close
        </button>
      </div>

      {/* Season Selector */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <button
            onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white transition-colors"
          >
            <span>Season {selectedSeason}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showSeasonDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showSeasonDropdown && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
              <ScrollArea className="max-h-60">
                {filteredSeasons.map((season) => (
                  <button
                    key={season.id}
                    onClick={() => {
                      setSelectedSeason(season.season_number);
                      setShowSeasonDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center justify-between ${
                      selectedSeason === season.season_number ? 'bg-primary/20 text-primary' : 'text-white'
                    }`}
                  >
                    <span>{season.name}</span>
                    <span className="text-xs text-white/50">{season.episode_count} eps</span>
                  </button>
                ))}
              </ScrollArea>
            </div>
          )}
        </div>
      </div>

      {/* Episode List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {episodes.map((episode) => {
              const isCurrentEpisode = 
                selectedSeason === currentSeason && 
                episode.episode_number === currentEpisode;

              return (
                <button
                  key={episode.id}
                  onClick={() => {
                    onSelectEpisode(selectedSeason, episode.episode_number);
                    onClose();
                  }}
                  className={`w-full flex gap-3 p-3 rounded-lg transition-colors text-left ${
                    isCurrentEpisode 
                      ? 'bg-primary/20 border border-primary/50' 
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative w-28 h-16 flex-shrink-0 rounded-md overflow-hidden bg-white/10">
                    {episode.still_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                        alt={episode.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="h-6 w-6 text-white/30" />
                      </div>
                    )}
                    {isCurrentEpisode && (
                      <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                        <Check className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-white font-medium text-sm truncate">
                        {episode.episode_number}. {episode.name}
                      </h3>
                      {episode.runtime && (
                        <span className="text-white/50 text-xs flex-shrink-0">
                          {episode.runtime}m
                        </span>
                      )}
                    </div>
                    <p className="text-white/50 text-xs mt-1 line-clamp-2">
                      {episode.overview || 'No description available'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
