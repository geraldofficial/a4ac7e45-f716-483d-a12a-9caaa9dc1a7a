
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi } from '@/services/tmdb';
import { Search } from 'lucide-react';

interface SearchSuggestionsProps {
  query: string;
  onSelect: (item: any) => void;
  onClose: () => void;
  isMobile?: boolean;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  onSelect,
  onClose,
  isMobile = false
}) => {
  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => tmdbApi.searchMulti(query),
    enabled: query.length > 2,
    staleTime: 2 * 60 * 1000,
  });

  if (query.length <= 2) return null;

  return (
    <div className={`absolute z-50 w-full bg-background/95 backdrop-blur-3xl border border-border/50 rounded-xl shadow-2xl mt-2 max-h-96 overflow-y-auto ${isMobile ? 'mt-4' : ''}`}>
      {isLoading ? (
        <div className="p-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-primary/20 border-t-primary rounded-full"></div>
            <span>Searching...</span>
          </div>
        </div>
      ) : results && results.length > 0 ? (
        <div className="py-2">
          {results.slice(0, 8).map((item) => (
            <button
              key={`${item.id}-${item.media_type}`}
              onClick={() => onSelect(item)}
              className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center space-x-3"
            >
              <div className="flex-shrink-0">
                {item.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                    alt={item.title || item.name}
                    className="w-10 h-15 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-15 bg-muted rounded flex items-center justify-center">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {item.title || item.name}
                </p>
                <p className="text-sm text-muted-foreground capitalize">
                  {item.media_type} {item.release_date && `• ${new Date(item.release_date).getFullYear()}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-muted-foreground">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
};
