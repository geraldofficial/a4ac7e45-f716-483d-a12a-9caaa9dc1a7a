
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface MovieFiltersProps {
  selectedType: 'all' | 'movie' | 'tv';
  selectedGenre: string;
  selectedYear: string;
  sortBy: string;
  onTypeChange: (type: 'all' | 'movie' | 'tv') => void;
  onGenreChange: (genre: string) => void;
  onYearChange: (year: string) => void;
  onSortChange: (sort: string) => void;
  onClearFilters: () => void;
}

const genres = [
  { id: '28', name: 'Action' },
  { id: '12', name: 'Adventure' },
  { id: '16', name: 'Animation' },
  { id: '35', name: 'Comedy' },
  { id: '80', name: 'Crime' },
  { id: '99', name: 'Documentary' },
  { id: '18', name: 'Drama' },
  { id: '10751', name: 'Family' },
  { id: '14', name: 'Fantasy' },
  { id: '36', name: 'History' },
  { id: '27', name: 'Horror' },
  { id: '10402', name: 'Music' },
  { id: '9648', name: 'Mystery' },
  { id: '10749', name: 'Romance' },
  { id: '878', name: 'Science Fiction' },
  { id: '10770', name: 'TV Movie' },
  { id: '53', name: 'Thriller' },
  { id: '10752', name: 'War' },
  { id: '37', name: 'Western' }
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

export const MovieFilters: React.FC<MovieFiltersProps> = ({
  selectedType,
  selectedGenre,
  selectedYear,
  sortBy,
  onTypeChange,
  onGenreChange,
  onYearChange,
  onSortChange,
  onClearFilters
}) => {
  return (
    <div className="bg-black/40 backdrop-blur-md p-4 rounded-lg border border-white/10 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-purple-400" />
        <h3 className="text-white font-semibold">Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Content Type */}
        <div>
          <label className="text-white text-sm mb-2 block">Type</label>
          <Select value={selectedType} onValueChange={onTypeChange}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="movie">Movies</SelectItem>
              <SelectItem value="tv">TV Shows</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Genre */}
        <div>
          <label className="text-white text-sm mb-2 block">Genre</label>
          <Select value={selectedGenre || 'all-genres'} onValueChange={(value) => onGenreChange(value === 'all-genres' ? '' : value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-genres">All Genres</SelectItem>
              {genres.map(genre => (
                <SelectItem key={genre.id} value={genre.id}>
                  {genre.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year */}
        <div>
          <label className="text-white text-sm mb-2 block">Year</label>
          <Select value={selectedYear || 'all-years'} onValueChange={(value) => onYearChange(value === 'all-years' ? '' : value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-years">All Years</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div>
          <label className="text-white text-sm mb-2 block">Sort By</label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Popularity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity.desc">Most Popular</SelectItem>
              <SelectItem value="popularity.asc">Least Popular</SelectItem>
              <SelectItem value="vote_average.desc">Highest Rated</SelectItem>
              <SelectItem value="vote_average.asc">Lowest Rated</SelectItem>
              <SelectItem value="release_date.desc">Newest First</SelectItem>
              <SelectItem value="release_date.asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="w-full border-white/30 text-white hover:bg-white/10"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
};
