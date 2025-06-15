
import React, { useState, useEffect } from 'react';
import { MovieCard } from './MovieCard';
import { LoadingSpinner } from './LoadingSpinner';
import { tmdbApi, Movie } from '@/services/tmdb';
import { useAuth } from '@/contexts/AuthContext';
import { watchHistoryService } from '@/services/watchHistory';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface ContinueWatchingProps {
  profile?: any;
}

export const ContinueWatching: React.FC<ContinueWatchingProps> = ({ profile }) => {
  const [continueWatchingMovies, setContinueWatchingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchContinueWatching = async () => {
      if (!user || !profile) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('ContinueWatching: Fetching for profile:', profile?.name || 'default');
        
        // Get continue watching items from watch history for this profile
        const continueWatchingItems = watchHistoryService.getContinueWatching(8);
        console.log('ContinueWatching: Found items:', continueWatchingItems.length);
        
        if (continueWatchingItems.length > 0) {
          // Fetch full movie data for these items
          const moviePromises = continueWatchingItems
            .filter(item => item.type === 'movie')
            .map(item => tmdbApi.getMovieDetails(item.tmdbId));
          
          const movies = await Promise.all(moviePromises);
          setContinueWatchingMovies(movies.filter(Boolean));
        } else {
          // If no history, show popular movies as placeholder
          const response = await tmdbApi.getPopularMovies(1);
          setContinueWatchingMovies(response.results.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching continue watching:', error);
        // Fallback to popular movies
        try {
          const response = await tmdbApi.getPopularMovies(1);
          setContinueWatchingMovies(response.results.slice(0, 6));
        } catch (fallbackError) {
          console.error('Error fetching fallback movies:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContinueWatching();
  }, [user, profile?.id]);

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

  if (!user || !profile || loading) {
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
            Continue Watching {profile?.name && `(${profile.name})`}
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
      
      {/* Mobile: Grid layout, Desktop: Horizontal scroll */}
      <div className="block md:hidden">
        <div className="grid grid-cols-2 gap-3 px-3">
          {continueWatchingMovies.slice(0, 6).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
      
      <div className="hidden md:block">
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
      </div>
    </section>
  );
};
