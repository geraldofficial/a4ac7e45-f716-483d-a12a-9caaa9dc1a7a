
import React from 'react';
import { ImprovedMovieCard } from './ImprovedMovieCard';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Movie } from '@/services/tmdb';

interface MovieGridProps {
  title: string;
  movies: Movie[];
  priority?: boolean;
  showRefresh?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const MovieGrid: React.FC<MovieGridProps> = ({ 
  title, 
  movies, 
  priority = false,
  showRefresh = false,
  refreshing = false,
  onRefresh,
}) => {
  return (
    <section className="mb-8 md:mb-12">
      <div className="flex items-center justify-between mb-4 md:mb-6 px-3 md:px-6">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-red-600 rounded-full"></div>
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-white">
            {title}
          </h2>
        </div>
        {showRefresh && onRefresh && (
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
            className="hidden md:flex"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin-slow' : ''}`} />
            Refresh
          </Button>
        )}
      </div>
      
      {/* Responsive Grid: 2 cols mobile, 3 cols tablet, 6 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 px-3 md:px-6">
        {movies.map((movie, index) => (
          <ImprovedMovieCard 
            key={movie.id}
            movie={movie} 
            priority={priority && index < 6}
            variant="default"
          />
        ))}
      </div>
    </section>
  );
};
