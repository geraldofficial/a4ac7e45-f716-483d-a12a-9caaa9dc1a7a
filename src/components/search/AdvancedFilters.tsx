
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Calendar, Star, Clock, Users } from 'lucide-react';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  onClose: () => void;
}

export interface SearchFilters {
  genres: number[];
  releaseYear: {
    min: number;
    max: number;
  };
  rating: {
    min: number;
    max: number;
  };
  runtime: {
    min: number;
    max: number;
  };
  sortBy: string;
  contentType: string;
  language: string;
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
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

const currentYear = new Date().getFullYear();

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onFiltersChange,
  onClose
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    genres: [],
    releaseYear: { min: 1950, max: currentYear },
    rating: { min: 0, max: 10 },
    runtime: { min: 0, max: 300 },
    sortBy: 'popularity.desc',
    contentType: 'all',
    language: 'en'
  });

  const toggleGenre = (genreId: number) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter(id => id !== genreId)
        : [...prev.genres, genreId]
    }));
  };

  const updateFilters = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(filters);
    onClose();
  };

  const handleClearFilters = () => {
    const defaultFilters: SearchFilters = {
      genres: [],
      releaseYear: { min: 1950, max: currentYear },
      rating: { min: 0, max: 10 },
      runtime: { min: 0, max: 300 },
      sortBy: 'popularity.desc',
      contentType: 'all',
      language: 'en'
    };
    setFilters(defaultFilters);
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Advanced Filters</h3>
        </div>
        <Button onClick={onClose} variant="ghost" size="sm">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Content Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Content Type</label>
          <Select 
            value={filters.contentType} 
            onValueChange={(value) => updateFilters('contentType', value)}
          >
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

        {/* Genres */}
        <div>
          <label className="text-sm font-medium mb-2 block">Genres</label>
          <div className="flex flex-wrap gap-2">
            {genres.map(genre => (
              <Badge
                key={genre.id}
                variant={filters.genres.includes(genre.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleGenre(genre.id)}
              >
                {genre.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Release Year */}
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Release Year: {filters.releaseYear.min} - {filters.releaseYear.max}
          </label>
          <div className="px-3">
            <Slider
              value={[filters.releaseYear.min, filters.releaseYear.max]}
              onValueChange={([min, max]) => updateFilters('releaseYear', { min, max })}
              min={1950}
              max={currentYear}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Star className="h-4 w-4" />
            Rating: {filters.rating.min} - {filters.rating.max}
          </label>
          <div className="px-3">
            <Slider
              value={[filters.rating.min, filters.rating.max]}
              onValueChange={([min, max]) => updateFilters('rating', { min, max })}
              min={0}
              max={10}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>

        {/* Runtime */}
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Runtime: {filters.runtime.min} - {filters.runtime.max} minutes
          </label>
          <div className="px-3">
            <Slider
              value={[filters.runtime.min, filters.runtime.max]}
              onValueChange={([min, max]) => updateFilters('runtime', { min, max })}
              min={0}
              max={300}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="text-sm font-medium mb-2 block">Sort By</label>
          <Select 
            value={filters.sortBy} 
            onValueChange={(value) => updateFilters('sortBy', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity.desc">Most Popular</SelectItem>
              <SelectItem value="vote_average.desc">Highest Rated</SelectItem>
              <SelectItem value="release_date.desc">Newest</SelectItem>
              <SelectItem value="release_date.asc">Oldest</SelectItem>
              <SelectItem value="title.asc">Title A-Z</SelectItem>
              <SelectItem value="title.desc">Title Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Users className="h-4 w-4" />
            Language
          </label>
          <Select 
            value={filters.language} 
            onValueChange={(value) => updateFilters('language', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="ja">Japanese</SelectItem>
              <SelectItem value="ko">Korean</SelectItem>
              <SelectItem value="zh">Chinese</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6 pt-6 border-t">
        <Button onClick={handleClearFilters} variant="outline" className="flex-1">
          Clear All
        </Button>
        <Button onClick={handleApplyFilters} className="flex-1">
          Apply Filters
        </Button>
      </div>
    </Card>
  );
};
