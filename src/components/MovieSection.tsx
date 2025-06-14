
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi } from '@/services/tmdb';
import { MovieCard } from './MovieCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MovieSectionProps {
  title?: string;
  endpoint?: string;
  category?: 'popular' | 'top_rated' | 'now_playing' | 'upcoming';
}

export const MovieSection: React.FC<MovieSectionProps> = ({ 
  title = "Popular Movies",
  category = 'popular'
}) => {
  const { data: movies, isLoading, error } = useQuery({
    queryKey: ['movies', category],
    queryFn: () => tmdbApi.getMovies(category),
    staleTime: 5 * 60 * 1000,
  });

  const scrollContainer = (direction: 'left' | 'right') => {
    const container = document.getElementById(`movie-section-${category}`);
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return null;
  if (!movies?.length) return null;

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => scrollContainer('left')}
              className="p-2 rounded-full bg-background/20 backdrop-blur-sm border border-border/20 hover:bg-background/40 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scrollContainer('right')}
              className="p-2 rounded-full bg-background/20 backdrop-blur-sm border border-border/20 hover:bg-background/40 transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div 
          id={`movie-section-${category}`}
          className="flex overflow-x-auto space-x-4 scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 w-48 md:w-56">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
