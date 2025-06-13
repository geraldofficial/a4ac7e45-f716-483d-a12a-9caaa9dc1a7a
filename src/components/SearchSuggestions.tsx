
import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { tmdbApi, Movie } from '@/services/tmdb';
import { useNavigate } from 'react-router-dom';

interface SearchSuggestionsProps {
  onClose?: () => void;
  className?: string;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ onClose, className }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Haptic feedback function
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        try {
          const results = await tmdbApi.searchSuggestions(query);
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (item: Movie) => {
    triggerHaptic();
    const type = item.title ? 'movie' : 'tv';
    navigate(`/${type}/${item.id}`);
    setShowSuggestions(false);
    setQuery('');
    onClose?.();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
      setQuery('');
      onClose?.();
    }
  };

  const getPosterUrl = (posterPath: string) => {
    return posterPath 
      ? `https://image.tmdb.org/t/p/w92${posterPath}`
      : 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=92&h=138&fit=crop';
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search..."
          className="pl-8 pr-3 py-2 h-9 text-sm bg-background/60 backdrop-blur-3xl border-border/60 rounded-full text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowSuggestions(true)}
        />
      </form>

      {showSuggestions && (
        <div className="fixed inset-x-2 mt-2 bg-background/95 backdrop-blur-3xl border border-border/70 rounded-2xl shadow-2xl z-[99999] max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">Searching...</div>
          ) : suggestions.length > 0 ? (
            suggestions.slice(0, 8).map((item) => (
              <button
                key={item.id}
                onClick={() => handleSuggestionClick(item)}
                className="w-full flex items-center gap-3 p-4 hover:bg-background/70 transition-all duration-200 text-left first:rounded-t-2xl last:rounded-b-2xl min-h-[64px] backdrop-blur-sm"
              >
                <img
                  src={getPosterUrl(item.poster_path)}
                  alt={item.title || item.name}
                  className="w-12 h-16 object-cover rounded-lg flex-shrink-0 shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium truncate text-sm">
                    {item.title || item.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {item.title ? 'Movie' : 'TV Show'} • {item.release_date || item.first_air_date ? new Date(item.release_date || item.first_air_date!).getFullYear() : 'N/A'}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    ⭐ {item.vote_average.toFixed(1)}
                  </p>
                </div>
              </button>
            ))
          ) : query && !loading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">No results found</div>
          ) : null}
        </div>
      )}
    </div>
  );
};
