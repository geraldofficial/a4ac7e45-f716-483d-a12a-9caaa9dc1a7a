
import React, { useState, useEffect } from 'react';
import { MovieCard } from './MovieCard';
import { LoadingSpinner } from './LoadingSpinner';
import { tmdbApi, Movie } from '@/services/tmdb';
import { useAuth } from '@/contexts/AuthContext';
import { watchHistoryService } from '@/services/watchHistory';
import { History, ChevronLeft, ChevronRight } from 'lucide-react';

interface RecentlyWatchedProps {
  profile?: any;
}

export const RecentlyWatched: React.FC<RecentlyWatchedProps> = ({ profile }) => {
  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecentlyWatched = async () => {
      if (!user || !profile) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('RecentlyWatched: Fetching for profile:', profile?.name || 'default');
        
        // Get recently watched items from watch history for this profile
        const recentItems = watchHistoryService.getFilteredHistory({
          type: 'movie',
          sortBy: 'lastWatched',
          sortOrder: 'desc',
          limit: 8
        });
        
        console.log('RecentlyWatched: Found items:', recentItems.length);
        
        if (recentItems.length > 0) {
          // Fetch full movie data for these items
          const moviePromises = recentItems.map(item => tmdbApi.getMovieDetails(item.tmdbId));
          const movies = await Promise.all(moviePromises);
          setRecentMovies(movies.filter(Boolean));
        } else {
          // If no history, show trending movies as placeholder
          const response = await tmdbApi.getTrendingMovies(1);
          setRecentMovies(response.results.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching recently watched:', error);
        // Fallback to trending movies
        try {
          const response = await tmdbApi.getTrendingMovies(1);
          setRecentMovies(response.results.slice(0, 6));
        } catch (fallbackError) {
          console.error('Error fetching fallback movies:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyWatched();
  }, [user, profile?.id]);

  const scrollSection = (direction: 'left' | 'right') => {
    const section = document.getElementById('recently-watched-scroll');
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
        <LoadingSpinner size="md" text="Loading your history..." />
      </div>
    ) : null;
  }

  if (recentMovies.length === 0) {
    return null;
  }

  return (
    <section className="mb-8 md:mb-12">
      <div className="flex items-center justify-between mb-4 md:mb-6 px-3 md:px-6">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-foreground">
            Recently Watched {profile?.name && `(${profile.name})`}
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
          {recentMovies.slice(0, 6).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
      
      <div className="hidden md:block">
        <div 
          id="recently-watched-scroll"
          className="flex gap-3 md:gap-4 lg:gap-6 overflow-x-auto pb-4 px-3 md:px-6 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {recentMovies.map((movie) => (
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
