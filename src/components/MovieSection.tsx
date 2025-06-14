
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi } from '@/services/tmdb';
import { MovieCard } from './MovieCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from './ErrorBoundary';

interface MovieSectionProps {
  title?: string;
  endpoint?: string;
  category?: 'popular' | 'top_rated' | 'now_playing' | 'upcoming';
}

export const MovieSection: React.FC<MovieSectionProps> = ({ 
  title = "Popular Movies",
  category = 'popular'
}) => {
  const { data: movies, isLoading, error, refetch } = useQuery({
    queryKey: ['movies', category],
    queryFn: () => tmdbApi.getMovies(category),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const scrollContainer = (direction: 'left' | 'right') => {
    const container = document.getElementById(`movie-section-${category}`);
    if (container) {
      const scrollAmount = window.innerWidth < 768 ? 200 : 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleRetry = () => {
    try {
      refetch();
    } catch (error) {
      console.error('Error retrying:', error);
    }
  };

  if (isLoading) {
    return (
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" text={`Loading ${title.toLowerCase()}...`} />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-destructive">Failed to Load</CardTitle>
              <CardDescription>{title} could not be loaded</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (!movies?.length) {
    return (
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">{title}</h2>
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No movies available at the moment</p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <ErrorBoundary>
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
            <div className="hidden md:flex space-x-2">
              <Button
                onClick={() => scrollContainer('left')}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => scrollContainer('right')}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div 
            id={`movie-section-${category}`}
            className="flex overflow-x-auto space-x-4 scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {movies.map((movie) => {
              if (!movie || !movie.id) return null;
              
              return (
                <div key={movie.id} className="flex-shrink-0 w-48 md:w-56">
                  <ErrorBoundary fallback={
                    <div className="w-full h-72 bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">Card unavailable</p>
                    </div>
                  }>
                    <MovieCard movie={movie} />
                  </ErrorBoundary>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
};
