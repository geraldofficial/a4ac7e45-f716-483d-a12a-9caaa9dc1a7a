import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, Star, Clock, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { MovieCard } from '@/components/MovieCard';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi } from '@/services/tmdb';

interface AdvancedSearchProps {
  onClose?: () => void;
  className?: string;
}

interface SearchFilters {
  query: string;
  type: 'all' | 'movie' | 'tv';
  genres: number[];
  year: number | null;
  rating: number[];
  runtime: number[];
  language: string;
  sortBy: string;
  includeAdult: boolean;
}

const genres = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' }
];

const sortOptions = [
  { value: 'popularity.desc', label: 'Popularity (High to Low)' },
  { value: 'popularity.asc', label: 'Popularity (Low to High)' },
  { value: 'vote_average.desc', label: 'Rating (High to Low)' },
  { value: 'vote_average.asc', label: 'Rating (Low to High)' },
  { value: 'release_date.desc', label: 'Release Date (Newest)' },
  { value: 'release_date.asc', label: 'Release Date (Oldest)' },
  { value: 'title.asc', label: 'Title (A-Z)' },
  { value: 'title.desc', label: 'Title (Z-A)' }
];

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onClose,
  className = ''
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    genres: [],
    year: null,
    rating: [0, 10],
    runtime: [0, 300],
    language: 'en',
    sortBy: 'popularity.desc',
    includeAdult: false
  });

  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const { data: searchResults, isLoading, refetch } = useQuery({
    queryKey: ['advanced-search', filters, page],
    queryFn: async () => {
      if (!filters.query.trim() && filters.genres.length === 0) {
        // Show discover results when no search query
        return tmdbApi.discover({
          type: filters.type === 'all' ? 'movie' : filters.type,
          genre: filters.genres.join(','),
          year: filters.year || undefined,
          rating_gte: filters.rating[0],
          rating_lte: filters.rating[1],
          runtime_gte: filters.runtime[0],
          runtime_lte: filters.runtime[1],
          language: filters.language,
          sort_by: filters.sortBy,
          include_adult: filters.includeAdult,
          page
        });
      }

      // Search with filters
      return tmdbApi.searchMulti(filters.query, page);
    },
    enabled: filters.query.trim().length > 0 || filters.genres.length > 0
  });

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const toggleGenre = (genreId: number) => {
    const newGenres = filters.genres.includes(genreId)
      ? filters.genres.filter(id => id !== genreId)
      : [...filters.genres, genreId];
    updateFilter('genres', newGenres);
  };

  const clearFilters = () => {
    setFilters({
      query: filters.query, // Keep the search query
      type: 'all',
      genres: [],
      year: null,
      rating: [0, 10],
      runtime: [0, 300],
      language: 'en',
      sortBy: 'popularity.desc',
      includeAdult: false
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.type !== 'all') count++;
    if (filters.genres.length > 0) count++;
    if (filters.year) count++;
    if (filters.rating[0] > 0 || filters.rating[1] < 10) count++;
    if (filters.runtime[0] > 0 || filters.runtime[1] < 300) count++;
    if (filters.language !== 'en') count++;
    if (filters.sortBy !== 'popularity.desc') count++;
    if (filters.includeAdult) count++;
    return count;
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

  const formatMovieData = (item: any) => ({
    id: item.id,
    title: item.title || item.name,
    overview: item.overview || '',
    poster_path: item.poster_path || '',
    backdrop_path: item.backdrop_path || '',
    vote_average: item.vote_average || 0,
    release_date: item.release_date || item.first_air_date || '',
    media_type: item.media_type || (item.title ? 'movie' : 'tv')
  });

  return (
    <div className={`bg-background min-h-screen ${className}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Advanced Search</h1>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search for movies, TV shows..."
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pl-10 pr-16 h-12 text-lg"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card border rounded-lg p-6 mb-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Content Type */}
              <div>
                <label className="text-sm font-medium mb-2 block">Content Type</label>
                <Select value={filters.type} onValueChange={(value: any) => updateFilter('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="movie">Movies</SelectItem>
                    <SelectItem value="tv">TV Shows</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Release Year */}
              <div>
                <label className="text-sm font-medium mb-2 block">Release Year</label>
                <Select 
                  value={filters.year?.toString() || 'any'} 
                  onValueChange={(value) => updateFilter('year', value === 'any' ? null : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Year</SelectItem>
                    {years.slice(0, 30).map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <Select value={filters.language} onValueChange={(value) => updateFilter('language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rating Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Rating: {filters.rating[0]} - {filters.rating[1]}
                </label>
                <Slider
                  value={filters.rating}
                  onValueChange={(value) => updateFilter('rating', value)}
                  max={10}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Runtime Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Runtime: {filters.runtime[0]} - {filters.runtime[1]} min
                </label>
                <Slider
                  value={filters.runtime}
                  onValueChange={(value) => updateFilter('runtime', value)}
                  max={300}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Genres */}
            <div>
              <label className="text-sm font-medium mb-3 block">Genres</label>
              <div className="flex flex-wrap gap-2">
                {genres.map(genre => (
                  <Badge
                    key={genre.id}
                    variant={filters.genres.includes(genre.id) ? "default" : "secondary"}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => toggleGenre(genre.id)}
                  >
                    {genre.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Include Adult Content */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-adult"
                checked={filters.includeAdult}
                onCheckedChange={(checked) => updateFilter('includeAdult', !!checked)}
              />
              <label htmlFor="include-adult" className="text-sm font-medium">
                Include adult content
              </label>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.type !== 'all' && (
              <Badge variant="outline" className="gap-1">
                Type: {filters.type}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('type', 'all')}
                />
              </Badge>
            )}
            {filters.genres.map(genreId => {
              const genre = genres.find(g => g.id === genreId);
              return genre ? (
                <Badge key={genreId} variant="outline" className="gap-1">
                  {genre.name}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => toggleGenre(genreId)}
                  />
                </Badge>
              ) : null;
            })}
            {filters.year && (
              <Badge variant="outline" className="gap-1">
                Year: {filters.year}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('year', null)}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : searchResults?.results?.length ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Found {searchResults.total_results} results
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
              {searchResults.results.map((item: any) => (
                <MovieCard
                  key={`${item.media_type || filters.type}-${item.id}`}
                  movie={formatMovieData(item)}
                />
              ))}
            </div>

            {/* Pagination */}
            {searchResults.total_pages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm text-muted-foreground">
                  Page {page} of {Math.min(searchResults.total_pages, 500)}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= searchResults.total_pages || page >= 500}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
