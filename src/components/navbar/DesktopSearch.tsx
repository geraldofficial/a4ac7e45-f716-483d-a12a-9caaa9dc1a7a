
import React, { useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SearchSuggestions } from '../SearchSuggestions';

export const DesktopSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="hidden md:block relative">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search movies, TV shows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-10 pr-4 py-2 bg-background/60 backdrop-blur-xl border border-border/50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            style={{ touchAction: 'manipulation', fontSize: '16px' }}
          />
        </div>
      </form>
      {searchQuery && (
        <SearchSuggestions
          query={searchQuery}
          onSelect={(item) => {
            navigate(`/${item.media_type}/${item.id}`);
            setSearchQuery('');
          }}
          onClose={() => setSearchQuery('')}
        />
      )}
    </div>
  );
};
