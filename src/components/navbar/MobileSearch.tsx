
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SearchSuggestions } from '../SearchSuggestions';

interface MobileSearchProps {
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

export const MobileSearch: React.FC<MobileSearchProps> = ({
  isSearchOpen,
  setIsSearchOpen
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  if (!isSearchOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsSearchOpen(true)}
        className="md:hidden p-2 hover:bg-background/60"
        style={{ touchAction: 'manipulation' }}
      >
        <Search className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div 
      className="md:hidden fixed inset-0 bg-background/95 backdrop-blur-3xl z-50 flex flex-col"
      style={{ pointerEvents: 'auto', touchAction: 'pan-y' }}
    >
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <h3 className="text-lg font-semibold text-foreground">Search</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSearchOpen(false)}
          className="p-2"
          style={{ touchAction: 'manipulation' }}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="p-4 flex-1" style={{ touchAction: 'pan-y' }}>
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search movies, TV shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-background/60 backdrop-blur-xl border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              style={{ touchAction: 'manipulation', fontSize: '16px' }}
              autoFocus
            />
          </div>
        </form>
        {searchQuery && (
          <SearchSuggestions
            query={searchQuery}
            onSelect={(item) => {
              navigate(`/${item.media_type}/${item.id}`);
              setSearchQuery('');
              setIsSearchOpen(false);
            }}
            onClose={() => setSearchQuery('')}
            isMobile={true}
          />
        )}
      </div>
    </div>
  );
};
