
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
    const type = item.title ? 'movie' : 'tv';
    navigate(`/${type}/${item.id}`);
    setShowSuggestions(false);
    setQuery('');
    onClose?.();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          placeholder="Search movies, TV shows..."
          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowSuggestions(true)}
        />
      </form>

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400">Searching...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSuggestionClick(item)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 transition-colors text-left"
              >
                <img
                  src={getPosterUrl(item.poster_path)}
                  alt={item.title || item.name}
                  className="w-12 h-18 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {item.title || item.name}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {item.title ? 'Movie' : 'TV Show'} • {item.release_date || item.first_air_date ? new Date(item.release_date || item.first_air_date!).getFullYear() : 'N/A'}
                  </p>
                  <p className="text-gray-500 text-xs truncate">
                    ⭐ {item.vote_average.toFixed(1)}
                  </p>
                </div>
              </button>
            ))
          ) : query && !loading ? (
            <div className="p-4 text-center text-gray-400">No results found</div>
          ) : null}
        </div>
      )}
    </div>
  );
};
