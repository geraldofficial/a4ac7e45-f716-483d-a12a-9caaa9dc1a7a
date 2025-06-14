
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi, Movie } from '@/services/tmdb';
import { LoadingSpinner } from './LoadingSpinner';

interface SearchSuggestionsProps {
  query: string;
  onSelect: (item: Movie) => void;
  onClose: () => void;
  isMobile?: boolean;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  onSelect,
  onClose,
  isMobile = false
}) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['search-suggestions', debouncedQuery],
    queryFn: () => tmdbApi.searchMulti(debouncedQuery),
    enabled: debouncedQuery.length > 2,
    staleTime: 5 * 60 * 1000,
  });

  if (!debouncedQuery || debouncedQuery.length <= 2) return null;

  return (
    <div className={`absolute top-full left-0 right-0 bg-background/95 backdrop-blur-3xl border border-border/50 rounded-xl mt-2 shadow-lg z-50 max-h-96 overflow-y-auto ${isMobile ? 'mt-4' : ''}`}>
      {isLoading ? (
        <div className="p-4 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : suggestions && suggestions.length > 0 ? (
        <div className="py-2">
          {suggestions.slice(0, 8).map((item) => (
            <button
              key={`${item.id}-${item.media_type}`}
              onClick={() => onSelect(item)}
              className="w-full px-4 py-3 text-left hover:bg-accent/50 transition-colors flex items-center space-x-3"
            >
              <div className="flex-shrink-0 w-12 h-16 bg-muted rounded overflow-hidden">
                {item.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                    alt={item.title || item.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {item.title || item.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
                  {item.release_date || item.first_air_date ? 
                    ` • ${(item.release_date || item.first_air_date)?.split('-')[0]}` : 
                    ''
                  }
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-muted-foreground">
          No results found for "{debouncedQuery}"
        </div>
      )}
    </div>
  );
};
