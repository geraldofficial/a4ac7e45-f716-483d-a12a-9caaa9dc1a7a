
import React, { useState, useEffect } from 'react';
import { MovieCard } from './MovieCard';
import { LoadingSpinner } from './LoadingSpinner';
import { tmdbApi, Movie } from '@/services/tmdb';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export const ContinueWatching = () => {
  const [continueWatchingMovies, setContinueWatchingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchContinueWatching = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // For now, we'll show popular movies as placeholder for continue watching
        // In a real app, this would fetch from user's watch history
        const response = await tmdbApi.getPopularMovies(1);
        setContinueWatchingMovies(response.results.slice(0, 8));
      } catch (error) {
        console.error('Error fetching continue watching:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContinueWatching();
  }, [user]);

  const scrollSection = (direction: 'left' | 'right') => {
    const section = document.getElementById('continue-watching-scroll');
    if (section) {
      const scrollAmount = window.innerWidth < 768 ? 200 : 400;
      section.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!user || loading) {
    return loading ? (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" text="Loading your content..." />
      </div>
    ) : null;
  }

  if (continueWatchingMovies.length === 0) {
    return null;
  }

  return (
    <section className="mb-8 md:mb-12">
      <div className="flex items-center justify-between mb-4 md:mb-6 px-3 md:px-6">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-foreground">
            Continue Watching
          </h2>
        </div>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scrollSection('left')}
            className="p-2 rounded-full bg-card/80 hover:bg-card border border-border hover:border-primary/50 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
          <button
            onClick={() => scrollSection('right')}
            className="p-2 rounded-full bg-card/80 hover:bg-card border border-border hover:border-primary/50 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
          >
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
        </div>
      </div>
      <div 
        id="continue-watching-scroll"
        className="flex gap-3 md:gap-4 lg:gap-6 overflow-x-auto pb-4 px-3 md:px-6 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {continueWatchingMovies.map((movie) => (
          <div 
            key={movie.id} 
            className="flex-shrink-0 w-32 sm:w-36 md:w-40 lg:w-48 xl:w-52"
          >
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </section>
  );
};
